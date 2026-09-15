<script setup>
import { computed, onMounted, ref } from 'vue';
import { Brain, BookOpenCheck, Layers3, Target, CircleCheck, Clock3, ChevronRight, Play, Trophy, TrendingUp, RotateCcw } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/api/auth';
import { useUserPracticeStore } from '~/stores/api/userPractice';
import { canAccessPage } from '~/utils/roles';

definePageMeta({ layout: 'default' });
const auth = useAuthStore();
const store = useUserPracticeStore();
const route = useRoute();
const ready = ref(false);
const selectedLevel = ref(1);
const count = ref(10);
const card = 'min-w-0 rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-6';
const levelIcons = { 1: BookOpenCheck, 2: Layers3, 3: Brain, 4: Trophy };
const levelNames = { 0: 'Belum ada', 1: 'Fundamental', 2: 'Intermediate', 3: 'Advanced', 4: 'Mastery' };
const summary = computed(() => [
  { label: 'Soal Dikerjakan', value: `${store.summary?.questions_attempted || 0} soal`, icon: BookOpenCheck },
  { label: 'Akurasi', value: store.summary?.accuracy == null ? '—' : `${store.summary.accuracy}%`, icon: Target },
  { label: 'Materi Dilatih', value: store.summary?.materials_practiced || 0, icon: Layers3 },
  { label: 'Level Tertinggi', value: levelNames[store.summary?.highest_level || 0], icon: Trophy },
]);
const currentLevel = computed(() => store.levels.find(row => row.level === selectedLevel.value));
const countOptions = computed(() => [5, 10, 15, 20].filter(value => value <= (currentLevel.value?.available_questions || 0)));
async function selectSubtest(code) { await store.fetchMaterials(code); }
async function selectMaterial(id) { const data = await store.fetchLevels(id); if (data) { selectedLevel.value = data.levels.find(row => row.recommended && row.available_questions >= 5)?.level || data.levels.find(row => row.available_questions >= 5)?.level || 1; count.value = [10, 5, 15, 20].find(value => value <= (data.levels.find(row => row.level === selectedLevel.value)?.available_questions || 0)) || 5; } }
function chooseLevel(level) { selectedLevel.value = level; count.value = [10, 5, 15, 20].find(value => value <= (currentLevel.value?.available_questions || 0)) || 5; }
async function start() { const session = await store.startSession(store.selectedMaterial?.id, selectedLevel.value, count.value); if (session) await navigateTo(`/practice/session/${session.session_id}`); }
async function followRecommendation() { if (!store.recommendation?.subtest) return; await selectSubtest(store.recommendation.subtest); const first = store.materials.find(item => item.available_questions >= 5); if (first) await selectMaterial(first.id); }
onMounted(async () => {
  auth.initializeAuth();
  if (!auth.token) return navigateTo('/login');
  const user = await auth.fetchCurrentUser();
  if (Number(user?.role) !== 2 || !canAccessPage(user?.role, 'practice')) return navigateTo('/dashboard');
  if (user?.is_activate !== true) return navigateTo('/dashboard');
  ready.value = true;
  await store.fetchPracticeOverview();
  const requestedSubtest = String(route.query.subtest || '').toUpperCase();
  const subtest = store.subtests.some(item => item.code === requestedSubtest) ? requestedSubtest : store.recommendation?.subtest || store.subtests[0]?.code;
  if (subtest) await selectSubtest(subtest);
  const requestedMaterial = Number(route.query.material_id);
  if (Number.isSafeInteger(requestedMaterial) && store.materials.some(item => item.id === requestedMaterial)) await selectMaterial(requestedMaterial);
});
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
    <header class="mb-5"><div class="inline-flex items-center gap-2 rounded-full bg-pale-blue px-3 py-1 text-xs font-semibold text-primary-container"><Brain class="h-4 w-4" />Latihan terarah</div><h1 class="mt-3 text-2xl font-bold text-on-surface sm:text-3xl">Practice</h1><p class="mt-1 text-sm text-on-surface-variant">Latih kemampuanmu berdasarkan subtes, materi, dan tingkat kesulitan.</p></header>
    <div v-if="store.error" role="alert" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 text-sm text-rose-700"><span>{{ store.error }}</span><button class="inline-flex items-center gap-1 font-semibold" @click="store.fetchPracticeOverview()"><RotateCcw class="h-4 w-4" />Coba Lagi</button></div>
    <div v-if="!ready || store.isLoading" class="space-y-4" aria-label="Memuat latihan"><div class="grid grid-cols-2 gap-3 lg:grid-cols-4"><div v-for="i in 4" :key="i" class="h-24 animate-pulse rounded-3xl bg-slate-200" /></div><div class="h-48 animate-pulse rounded-3xl bg-slate-200" /><div class="h-64 animate-pulse rounded-3xl bg-slate-200" /></div>
    <template v-else>
      <section class="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><article v-for="item in summary" :key="item.label" :class="card" class="p-4"><component :is="item.icon" class="mb-3 h-5 w-5 text-primary-container" /><p class="text-xs text-outline">{{ item.label }}</p><strong class="mt-1 block text-lg text-on-surface">{{ item.value }}</strong></article></section>
      <section :class="card" class="mb-5"><div class="mb-4 flex items-center gap-2"><Brain class="h-5 w-5 text-primary-container" /><h2 class="text-lg font-bold">Pilih Subtes</h2></div><div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"><button v-for="item in store.subtests" :key="item.code" class="min-w-0 rounded-2xl border p-3 text-left" :class="store.selectedSubtest === item.code ? 'border-blue-600 bg-pale-blue' : 'border-soft-blue hover:bg-surface-container-low'" @click="selectSubtest(item.code)"><strong class="text-primary-container">{{ item.code }}</strong><span class="mt-1 block min-h-10 text-xs font-semibold leading-snug">{{ item.name }}</span><span class="mt-2 block text-xs text-outline">{{ item.available_questions }} soal tersedia</span><span class="block text-xs text-outline">Akurasi {{ item.accuracy == null ? '—' : `${item.accuracy}%` }}</span></button></div></section>
      <section :class="card" class="mb-5"><div class="mb-4 flex items-center gap-2"><BookOpenCheck class="h-5 w-5 text-primary-container" /><div><h2 class="text-lg font-bold">Pilih Materi</h2><p class="text-xs text-outline">{{ store.selectedSubtest || 'Pilih subtes' }} · materi aktif yang memiliki soal terkait</p></div></div><div v-if="!store.materials.length" class="rounded-2xl bg-surface-container-low p-6 text-center text-sm text-outline">Belum ada materi aktif pada subtes ini.</div><div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><button v-for="item in store.materials" :key="item.id" class="rounded-2xl border p-4 text-left" :class="store.selectedMaterial?.id === item.id ? 'border-blue-600 bg-pale-blue' : 'border-soft-blue hover:bg-surface-container-low'" @click="selectMaterial(item.id)"><strong class="block text-sm">{{ item.title }}</strong><span class="mt-1 block text-xs text-outline">{{ item.available_questions }} soal · {{ item.attempted }} dikerjakan</span><span class="block text-xs text-outline">Akurasi {{ item.accuracy == null ? '—' : `${item.accuracy}%` }} · {{ levelNames[item.highest_completed_level] }}</span></button></div></section>
      <section v-if="store.selectedMaterial" :class="card" class="mb-5"><div class="mb-4 flex items-center gap-2"><Layers3 class="h-5 w-5 text-primary-container" /><div><h2 class="text-lg font-bold">Practice Levels</h2><p class="text-xs text-outline">{{ store.selectedMaterial.title }}</p></div></div><div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><button v-for="level in store.levels" :key="level.level" class="rounded-2xl border p-4 text-left" :class="selectedLevel === level.level ? 'border-blue-600 bg-pale-blue' : 'border-soft-blue hover:bg-surface-container-low'" @click="chooseLevel(level.level)"><component :is="levelIcons[level.level]" class="h-5 w-5 text-primary-container" /><span class="mt-3 block text-xs font-bold text-primary-container">0{{ level.level }} <span v-if="level.recommended" class="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">Direkomendasikan</span></span><strong class="mt-1 block">{{ level.name }}</strong><p class="mt-2 min-h-10 text-xs text-on-surface-variant">{{ level.description }}</p><p class="mt-2 text-xs text-outline">{{ level.available_questions }} soal · {{ level.attempted }} dikerjakan</p><p class="text-xs text-outline">Akurasi {{ level.accuracy == null ? '—' : `${level.accuracy}%` }}</p></button></div><div class="mt-5 flex flex-wrap items-end gap-3 rounded-2xl bg-surface-container-low p-4"><div class="min-w-0 flex-1"><p class="text-sm font-semibold">{{ currentLevel?.name }}</p><p class="text-xs text-outline">{{ currentLevel?.available_questions || 0 }} soal tersedia{{ !countOptions.length ? '. Coba level lain.' : '' }}</p></div><label class="text-xs font-semibold">Jumlah Soal<select v-model.number="count" :disabled="!countOptions.length" class="mt-1 block rounded-xl border border-soft-blue bg-white px-3 py-2"><option v-for="option in countOptions" :key="option" :value="option">{{ option }} soal</option></select></label><button :disabled="!countOptions.length || store.isStarting" class="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40" @click="start"><Play class="h-4 w-4" />Mulai Latihan</button></div></section>
      <div class="grid gap-4 lg:grid-cols-12"><section :class="card" class="lg:col-span-8"><div class="mb-3 flex items-center gap-2"><Clock3 class="h-5 w-5 text-primary-container" /><h2 class="font-bold">Latihan Terakhir</h2></div><p v-if="!store.recentSessions.length" class="rounded-2xl bg-surface-container-low p-5 text-sm text-outline">Belum ada latihan selesai. Pilih materi dan mulai sesi pertamamu.</p><NuxtLink v-for="item in store.recentSessions" :key="item.session_id" :to="`/practice/session/${item.session_id}`" class="flex items-center justify-between gap-3 border-t border-soft-blue py-3 text-sm"><span><strong class="block">{{ item.material_title }}</strong><small class="text-outline">{{ item.subtest }} · {{ levelNames[item.difficulty_level] }} · {{ item.question_count }} soal</small></span><span class="shrink-0 font-semibold text-primary-container">{{ item.accuracy }}%</span></NuxtLink></section><aside :class="card" class="lg:col-span-4"><div class="flex items-center gap-2"><TrendingUp class="h-5 w-5 text-primary-container" /><h2 class="font-bold">Rekomendasi untukmu</h2></div><template v-if="store.recommendation"><p class="mt-4 text-xs font-bold text-primary-container">{{ store.recommendation.subtest }}</p><h3 class="font-semibold">{{ store.recommendation.name }}</h3><p class="mt-2 text-sm text-on-surface-variant">{{ store.recommendation.description }}</p><button class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-container" @click="followRecommendation">Lihat Latihan <ChevronRight class="h-4 w-4" /></button></template><p v-else class="mt-4 text-sm text-outline">Rekomendasi akan muncul setelah materi dan progres tersedia.</p></aside></div>
    </template>
  </div>
</template>
