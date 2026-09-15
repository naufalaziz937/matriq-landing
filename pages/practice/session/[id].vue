<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { ArrowLeft, Brain, Check, CircleCheck, CircleX, Clock3, ChevronRight, Trophy, RotateCcw } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/api/auth';
import { useUserPracticeStore } from '~/stores/api/userPractice';
import { canAccessPage } from '~/utils/roles';

definePageMeta({ layout: 'default' });
const auth = useAuthStore();
const store = useUserPracticeStore();
const route = useRoute();
const ready = ref(false);
const selectedAnswer = ref('');
const elapsed = ref(0);
const questionStarted = ref(Date.now());
let timer;
const levels = { 1: 'Fundamental', 2: 'Intermediate', 3: 'Advanced', 4: 'Mastery' };
const session = computed(() => store.currentSession);
const question = computed(() => session.value?.questions?.[store.currentQuestionIndex]);
const feedback = computed(() => question.value ? store.feedbackByQuestion[question.value.question_id] : null);
const answeredCount = computed(() => session.value?.questions?.filter(item => item.answered || store.feedbackByQuestion[item.question_id]).length || 0);
const clock = seconds => `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
watch(() => store.currentQuestionIndex, () => { selectedAnswer.value = question.value?.selected_answer || ''; questionStarted.value = Date.now(); });
async function answer() {
  if (!question.value || !selectedAnswer.value || feedback.value) return;
  const result = await store.submitAnswer(session.value.session_id, question.value.question_id, selectedAnswer.value, Math.max(0, Math.round((Date.now() - questionStarted.value) / 1000)));
  if (result) question.value.answered = true;
}
function next() { if (store.currentQuestionIndex < session.value.questions.length - 1) store.currentQuestionIndex++; }
async function finish() { if (answeredCount.value < session.value.question_count && !confirm(`Masih ada ${session.value.question_count - answeredCount.value} soal belum dijawab. Selesaikan latihan?`)) return; await store.completeSession(session.value.session_id); }
async function load() { const data = await store.fetchSession(route.params.id); if (data?.status === 'completed') await store.fetchSessionResult(route.params.id); }
onMounted(async () => {
  auth.initializeAuth();
  if (!auth.token) return navigateTo('/login');
  const user = await auth.fetchCurrentUser();
  if (Number(user?.role) !== 2 || !canAccessPage(user?.role, 'practice.attempt')) return navigateTo('/dashboard');
  if (user?.is_activate !== true) return navigateTo('/dashboard');
  ready.value = true; await load();
  timer = setInterval(() => { elapsed.value++; }, 1000);
});
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="mx-auto w-full max-w-4xl min-w-0 px-4 py-5 sm:px-6 sm:py-7">
    <NuxtLink to="/practice" class="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-container"><ArrowLeft class="h-4 w-4" />Kembali ke Practice</NuxtLink>
    <div v-if="store.error" role="alert" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 text-sm text-rose-700"><span>{{ store.error }}</span><button class="inline-flex items-center gap-1 font-semibold" @click="load"><RotateCcw class="h-4 w-4" />Coba Lagi</button></div>
    <div v-if="!ready || store.isLoading" class="space-y-4" aria-label="Memuat sesi latihan"><div class="h-28 animate-pulse rounded-3xl bg-slate-200" /><div class="h-96 animate-pulse rounded-3xl bg-slate-200" /></div>
    <section v-else-if="store.sessionResult" class="space-y-5"><div class="rounded-3xl border border-soft-blue bg-surface-white p-5 text-center shadow-sm sm:p-8"><Trophy class="mx-auto h-10 w-10 text-primary-container" /><h1 class="mt-3 text-2xl font-bold">Latihan Selesai 🎉</h1><p class="mt-2 text-sm text-on-surface-variant">{{ levels[store.sessionResult.difficulty_level] }} · {{ store.sessionResult.subtest }}</p><strong class="mt-4 block text-3xl text-primary-container">{{ store.sessionResult.correct_count }} / {{ store.sessionResult.question_count }} benar</strong><div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div v-for="item in [{label:'Akurasi',value:`${store.sessionResult.accuracy}%`},{label:'Jawaban Benar',value:store.sessionResult.correct_count},{label:'Jawaban Salah',value:store.sessionResult.wrong_count},{label:'Waktu',value:clock(store.sessionResult.duration_seconds)}]" :key="item.label" class="rounded-2xl bg-surface-container-low p-3"><p class="text-xs text-outline">{{ item.label }}</p><strong class="mt-1 block">{{ item.value }}</strong></div></div><p v-if="store.sessionResult.unanswered_count" class="mt-3 text-xs text-outline">{{ store.sessionResult.unanswered_count }} soal tidak dijawab.</p></div><section class="rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm sm:p-6"><h2 class="text-lg font-bold">Review Jawaban</h2><div v-for="(item,index) in store.sessionResult.review" :key="item.question_id" class="mt-4 border-t border-soft-blue pt-4"><p class="text-xs font-semibold text-primary-container">Soal {{ index + 1 }}</p><h3 class="mt-1 whitespace-pre-wrap font-semibold">{{ item.question }}</h3><p class="mt-2 text-sm" :class="item.is_correct ? 'text-success-emerald' : 'text-danger-rose'">{{ item.is_correct === true ? 'Benar' : item.is_correct === false ? 'Belum tepat' : 'Tidak dijawab' }} · Jawabanmu {{ item.selected_answer || '—' }} · Kunci {{ item.correct_answer }}</p><p class="mt-2 whitespace-pre-wrap rounded-xl bg-pale-blue p-3 text-sm">{{ item.explanation }}</p></div></section></section>
    <template v-else-if="session"><header class="mb-5 rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm"><div class="flex flex-wrap items-center justify-between gap-3"><div><p class="text-xs font-semibold text-primary-container">{{ session.subtest }} · {{ levels[session.difficulty_level] }}</p><h1 class="mt-1 text-xl font-bold">Latihan Soal</h1></div><div class="inline-flex items-center gap-2 text-sm text-on-surface-variant"><Clock3 class="h-4 w-4" />{{ clock(elapsed) }}</div></div><p class="mt-3 text-xs text-outline">Soal {{ store.currentQuestionIndex + 1 }} dari {{ session.question_count }} · {{ answeredCount }} dijawab</p><div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-container"><div class="h-full rounded-full bg-primary-container transition-all" :style="{ width: `${Math.round(100 * answeredCount / session.question_count)}%` }" /></div></header><section class="rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm sm:p-7"><p class="text-xs font-semibold text-primary-container">Pertanyaan {{ store.currentQuestionIndex + 1 }}</p><h2 class="mt-3 whitespace-pre-wrap text-lg font-semibold leading-relaxed">{{ question?.question }}</h2><div class="mt-5 space-y-2"><button v-for="option in question?.options || []" :key="option.key" :disabled="!!feedback" class="flex w-full items-start gap-3 rounded-2xl border p-3 text-left text-sm disabled:cursor-default" :class="selectedAnswer === option.key ? 'border-blue-600 bg-pale-blue' : 'border-soft-blue hover:bg-surface-container-low'" @click="selectedAnswer = option.key"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white font-bold text-primary-container">{{ option.key }}</span><span class="pt-1">{{ option.text }}</span></button></div><div v-if="feedback" class="mt-5 rounded-2xl p-4" :class="feedback.is_correct ? 'bg-success-soft' : 'bg-danger-soft'"><div class="flex items-center gap-2 font-semibold" :class="feedback.is_correct ? 'text-success-emerald' : 'text-danger-rose'"><CircleCheck v-if="feedback.is_correct" class="h-5 w-5" /><CircleX v-else class="h-5 w-5" />{{ feedback.is_correct ? 'Jawaban kamu benar' : 'Belum tepat' }}</div><p class="mt-2 text-sm">Jawaban benar: {{ feedback.correct_answer }}</p><p class="mt-2 whitespace-pre-wrap text-sm"><strong>Pembahasan:</strong> {{ feedback.explanation }}</p></div><div class="mt-5 flex flex-wrap justify-between gap-2"><button class="rounded-xl border border-soft-blue px-4 py-2 text-sm" @click="finish">Selesaikan Sekarang</button><button v-if="!feedback" :disabled="!selectedAnswer || store.isAnswering" class="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" @click="answer"><Check class="h-4 w-4" />Jawab</button><button v-else-if="store.currentQuestionIndex < session.questions.length - 1" class="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-white" @click="next">Selanjutnya <ChevronRight class="h-4 w-4" /></button><button v-else :disabled="store.isCompleting" class="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" @click="finish">Lihat Hasil <ChevronRight class="h-4 w-4" /></button></div></section></template>
  </div>
</template>
