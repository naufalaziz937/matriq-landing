<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ArrowLeft, LoaderCircle, Pencil, RefreshCw } from 'lucide-vue-next';
import QuestionForm from '~/components/question-bank/QuestionForm.vue';
import { useAuthStore } from '~/stores/api/auth';
import { useQuestionBankStore } from '~/stores/api/questionBank';
import { canAccessPage, ROLES } from '~/utils/roles';

definePageMeta({ layout: 'default' });
const authStore = useAuthStore();
const bank = useQuestionBankStore();
const route = useRoute();
const ready = ref(false);
const loading = ref(false);
const error = ref('');
const isEditing = computed(() => route.query.edit === '1');
const question = computed(() => bank.selectedQuestion);
const subtests: Record<string, string> = { PU: 'Penalaran Umum', PPU: 'Pengetahuan dan Pemahaman Umum', PBM: 'Pemahaman Bacaan dan Menulis', PK: 'Pengetahuan Kuantitatif', LBI: 'Literasi Bahasa Indonesia', LBE: 'Literasi Bahasa Inggris', PM: 'Penalaran Matematika' };
const difficulty: Record<string, string> = { easy: 'Mudah', medium: 'Sedang', hard: 'Sulit', 1: 'Fundamental', 2: 'Intermediate', 3: 'Advanced', 4: 'Mastery' };

async function loadQuestion() {
  loading.value = true;
  error.value = '';
  try {
    await bank.fetchQuestionById(route.params.id);
  } catch (err: any) {
    error.value = err?.data?.message || 'Gagal memuat detail soal.';
  } finally {
    loading.value = false;
  }
}
async function save(payload: Record<string, any>) {
  error.value = '';
  try {
    await bank.updateQuestion(route.params.id, payload);
    await loadQuestion();
    await navigateTo(`/question-bank/${route.params.id}`);
  } catch {
    error.value = bank.error || 'Gagal memperbarui soal.';
  }
}

watch(() => route.params.id, () => { if (ready.value) loadQuestion(); });
onMounted(async () => {
  authStore.initializeAuth();
  if (!authStore.token) return navigateTo('/login');
  const user = await authStore.fetchCurrentUser();
  if (Number(user?.role) !== ROLES.ADMIN || !canAccessPage(user?.role, 'question.read')) return navigateTo('/dashboard');
  ready.value = true;
  await loadQuestion();
});
</script>

<template>
  <div v-if="ready" class="mx-auto w-full max-w-[1536px] px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10">
    <NuxtLink to="/question-bank" class="mb-5 inline-flex items-center gap-2 font-label-sm text-label-sm text-primary-container"><ArrowLeft class="h-4 w-4" />Kembali ke Bank Soal</NuxtLink>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 class="font-headline-md text-headline-md text-on-surface">{{ isEditing ? 'Edit Soal' : 'Detail Soal' }}</h1><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">Soal #{{ route.params.id }}</p></div><NuxtLink v-if="!isEditing && question && canAccessPage(authStore.user?.role, 'question.update')" :to="`/question-bank/${route.params.id}?edit=1`" class="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white"><Pencil class="h-4 w-4" />Edit Soal</NuxtLink></div>
    <div v-if="loading" class="flex items-center gap-2 rounded-3xl border border-soft-blue bg-surface-white p-6 font-body-sm text-body-sm text-on-surface-variant"><LoaderCircle class="h-5 w-5 animate-spin" />Memuat soal...</div>
    <div v-else-if="error && !question" role="alert" class="rounded-3xl border border-soft-blue bg-surface-white p-6"><p class="font-body-sm text-body-sm text-danger-rose">{{ error }}</p><button type="button" class="mt-4 inline-flex items-center gap-2 font-label-sm text-label-sm text-primary-container" @click="loadQuestion"><RefreshCw class="h-4 w-4" />Coba Lagi</button></div>
    <template v-else-if="question">
      <p v-if="error" role="alert" class="mb-4 rounded-2xl bg-danger-soft px-4 py-3 font-body-sm text-body-sm text-danger-rose">{{ error }}</p>
      <QuestionForm v-if="isEditing && canAccessPage(authStore.user?.role, 'question.update')" :initial="question" :categories="bank.categories" :saving="bank.isSubmitting" @submit="save" />
      <article v-else class="space-y-5 rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm sm:p-6">
        <div class="flex flex-wrap gap-2 font-caption text-caption"><span class="rounded-full bg-pale-blue px-3 py-1 text-primary-container">{{ subtests[question.subtest] ?? question.subtest }}</span><span class="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">{{ question.category }}</span><span v-if="question.material" class="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">{{ question.material.title }}</span><span class="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">{{ difficulty[question.difficulty_level] ?? difficulty[question.difficulty] ?? question.difficulty }}</span><span class="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">{{ { active:'Aktif', review:'Review', rejected:'Ditolak', draft:'Draft' }[question.status] || question.status }}</span></div>
        <div class="flex items-center gap-3 rounded-2xl bg-surface-container-low p-3"><img v-if="question.created_by?.foto_profile" :src="question.created_by.foto_profile" alt="" class="h-10 w-10 rounded-full object-cover" /><span v-else class="flex h-10 w-10 items-center justify-center rounded-full bg-pale-blue text-primary-container">{{ question.created_by?.nama?.slice(0,1) || 'A' }}</span><span><span class="block text-xs text-outline">Dibuat oleh</span><strong>{{ question.created_by?.nama || 'Admin MatrIQ' }}</strong><small class="ml-2 text-outline">{{ Number(question.created_by?.role)===1?'Admin':'Tutor' }}</small></span></div>
        <p v-if="question.rejection_reason" class="rounded-2xl bg-danger-soft p-4 text-danger-rose">Alasan Penolakan: {{ question.rejection_reason }}</p>
        <div><h2 class="font-label-md text-label-md text-on-surface">Pertanyaan</h2><p class="mt-2 whitespace-pre-wrap font-body-md text-body-md text-on-surface-variant">{{ question.question }}</p></div>
        <div><h2 class="font-label-md text-label-md text-on-surface">Pilihan Jawaban</h2><ol class="mt-2 space-y-2"><li v-for="option in question.options" :key="option.key" class="rounded-2xl border p-3 font-body-md text-body-md" :class="option.key === question.correct_answer ? 'border-success-emerald bg-success-soft text-on-surface' : 'border-soft-blue text-on-surface-variant'"><strong class="mr-2">{{ option.key }}.</strong>{{ option.text }}</li></ol></div>
        <div><h2 class="font-label-md text-label-md text-on-surface">Pembahasan</h2><p class="mt-2 whitespace-pre-wrap font-body-md text-body-md text-on-surface-variant">{{ question.explanation }}</p></div>
      </article>
    </template>
  </div>
</template>
