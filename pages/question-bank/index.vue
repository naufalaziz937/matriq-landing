<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  AlertCircle, BookOpenCheck, ChevronLeft, ChevronRight, CircleCheck, Clock3,
  EllipsisVertical, Eye, FileUp, FilePenLine, LibraryBig, LoaderCircle, Pencil, Plus,
  RefreshCw, Search, Trash2,
} from 'lucide-vue-next';
import ImportQuestionsModal from '~/components/question-bank/ImportQuestionsModal.vue';
import { useAuthStore } from '~/stores/api/auth';
import { useQuestionBankStore } from '~/stores/api/questionBank';
import { canAccessPage, ROLES } from '~/utils/roles';

definePageMeta({ layout: 'default' });

const authStore = useAuthStore();
const bank = useQuestionBankStore();
const ready = ref(false);
const menuId = ref<string | number | null>(null);
const deleteTarget = ref<any>(null);
const actionError = ref('');
const actionBusy = ref(false);
const showImport = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const subtests = [
  { code: 'PU', label: 'Penalaran Umum' },
  { code: 'PPU', label: 'Pengetahuan dan Pemahaman Umum' },
  { code: 'PBM', label: 'Pemahaman Bacaan dan Menulis' },
  { code: 'PK', label: 'Pengetahuan Kuantitatif' },
  { code: 'LBI', label: 'Literasi Bahasa Indonesia' },
  { code: 'LBE', label: 'Literasi Bahasa Inggris' },
  { code: 'PM', label: 'Penalaran Matematika' },
];
const summaryCards = computed(() => [
  { label: 'Total Soal', value: bank.summary.total, icon: LibraryBig, tone: 'bg-pale-blue text-primary-container' },
  { label: 'Soal Aktif', value: bank.summary.active, icon: CircleCheck, tone: 'bg-success-soft text-success-emerald' },
  { label: 'Draft', value: bank.summary.draft, icon: FilePenLine, tone: 'bg-soft-orange text-on-secondary-container' },
  { label: 'Perlu Review', value: bank.summary.review, icon: Clock3, tone: 'bg-accent-purple-soft text-accent-purple' },
]);
const startRow = computed(() => bank.pagination.total ? (bank.pagination.page - 1) * bank.pagination.limit + 1 : 0);
const endRow = computed(() => Math.min(bank.pagination.page * bank.pagination.limit, bank.pagination.total));

function questionId(item: any) { return item.id ?? item.question_id ?? item.soal_id; }
function questionText(item: any) { return item.question ?? item.pertanyaan ?? item.text ?? item.soal ?? 'Soal tanpa teks'; }
function subtestCode(item: any) {
  const value = item.subtest?.code ?? item.subtest?.name ?? item.subtest ?? item.subtes;
  return subtests.find((entry) => entry.code === value || entry.label === value)?.code ?? value ?? '—';
}
function categoryName(item: any) { return item.category?.name ?? item.category?.nama ?? item.kategori?.nama ?? item.kategori ?? '—'; }
function difficultyLabel(item: any) {
  if (item.difficulty_level) return ({ 1: 'Fundamental', 2: 'Intermediate', 3: 'Advanced', 4: 'Mastery' } as Record<number, string>)[item.difficulty_level] || '—';
  return { easy: 'Mudah', medium: 'Sedang', hard: 'Sulit', mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' }[String(item.difficulty ?? item.tingkat_kesulitan ?? '').toLowerCase()] ?? '—';
}
function statusLabel(item: any) {
  return { active: 'Aktif', aktif: 'Aktif', draft: 'Draft', review: 'Review', pending_review: 'Review', rejected: 'Ditolak' }[String(item.status ?? '').toLowerCase()] ?? '—';
}
function statusClass(item: any) {
  const status = statusLabel(item);
  return status === 'Aktif' ? 'bg-success-soft text-success-emerald' : status === 'Review' ? 'bg-soft-orange text-on-secondary-container' : status === 'Ditolak' ? 'bg-danger-soft text-danger-rose' : 'bg-surface-container text-outline';
}
function creatorName(item: any) { const user = item.created_by ?? item.creator; return user?.nama ?? user?.name ?? '—'; }
function creatorRole(item: any) { return Number((item.created_by ?? item.creator)?.role) === 1 ? 'Admin' : 'Tutor'; }
function formatDate(value: string | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
function detailsPath(item: any, edit = false) {
  const id = questionId(item);
  return id == null ? '/question-bank' : `/question-bank/${encodeURIComponent(id)}${edit ? '?edit=1' : ''}`;
}
async function refresh() { await Promise.all([bank.fetchQuestions(), bank.fetchSummary()]); }
function applyFilter() { bank.pagination.page = 1; bank.fetchQuestions(); }
function changePage(next: number) {
  if (next < 1 || next > bank.pagination.totalPages) return;
  bank.pagination.page = next;
  bank.fetchQuestions();
}
function selectAction(item: any, action: 'view' | 'edit' | 'delete') {
  menuId.value = null;
  if (action === 'delete') {
    actionError.value = '';
    deleteTarget.value = item;
  } else navigateTo(detailsPath(item, action === 'edit'));
}
async function confirmDelete() {
  if (!deleteTarget.value || actionBusy.value || !canAccessPage(authStore.user?.role, 'question.delete')) return;
  const id = questionId(deleteTarget.value);
  if (id == null) return;
  actionBusy.value = true;
  actionError.value = '';
  try {
    await bank.deleteQuestion(id);
    deleteTarget.value = null;
    if (bank.questions.length === 1 && bank.pagination.page > 1) bank.pagination.page -= 1;
    await refresh();
  } catch {
    actionError.value = bank.error || 'Gagal menghapus soal.';
    bank.error = '';
  } finally {
    actionBusy.value = false;
  }
}

watch(() => bank.filters.search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applyFilter, 350);
});
onBeforeUnmount(() => clearTimeout(searchTimer));
onMounted(async () => {
  authStore.initializeAuth();
  if (!authStore.token) return navigateTo('/login');
  const user = await authStore.fetchCurrentUser();
  if (Number(user?.role) !== ROLES.ADMIN || !canAccessPage(user?.role, 'question-bank')) return navigateTo('/dashboard');
  ready.value = true;
  await refresh();
});
</script>

<template>
  <div v-if="ready" class="mx-auto w-full max-w-[1536px] min-w-0 px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10">
    <header class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div><h1 class="font-headline-md text-headline-md text-on-surface">Bank Soal</h1><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">Kelola seluruh soal latihan MatrIQ.</p></div>
      <div class="flex items-center gap-2 flex-wrap">
        <button v-if="canAccessPage(authStore.user?.role, 'question.ai-import')" type="button" class="inline-flex items-center gap-2 rounded-2xl border border-primary-container px-4 py-2.5 font-label-sm text-label-sm text-primary-container hover:bg-pale-blue transition-colors" @click="showImport = true"><FileUp class="h-4 w-4" />Import Excel</button>
        <NuxtLink v-if="canAccessPage(authStore.user?.role, 'question.create')" to="/question-bank/create" class="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white hover:bg-brand-700"><Plus class="h-4 w-4" />Tambah Soal</NuxtLink>
      </div>
    </header>

    <section class="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Ringkasan Bank Soal">
      <article v-for="card in summaryCards" :key="card.label" class="rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-5">
        <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl" :class="card.tone"><component :is="card.icon" class="h-[22px] w-[22px]" /></div>
        <p class="font-caption text-caption text-outline">{{ card.label }}</p>
        <div v-if="bank.isLoading" class="mt-2 h-8 w-16 animate-pulse rounded-lg bg-surface-container" />
        <p v-else class="mt-1 font-headline-md text-headline-md text-on-surface">{{ card.value ?? '—' }}</p>
      </article>
    </section>

    <section class="min-w-0 rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-6">
      <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(140px,auto))_auto]">
        <label class="relative min-w-0"><Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" /><input v-model="bank.filters.search" type="search" placeholder="Cari soal..." class="w-full rounded-2xl border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-3 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary-container" /></label>
        <select v-model="bank.filters.subtest" aria-label="Filter subtes" class="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-on-surface" @change="applyFilter"><option value="">Semua Subtes</option><option v-for="item in subtests" :key="item.code" :value="item.code">{{ item.label }}</option></select>
        <select v-model="bank.filters.difficulty" aria-label="Filter kesulitan" class="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-on-surface" @change="applyFilter"><option value="">Semua Tingkat</option><option value="1">Fundamental</option><option value="2">Intermediate</option><option value="3">Advanced</option><option value="4">Mastery</option></select>
        <select v-model="bank.filters.status" aria-label="Filter status" class="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-on-surface" @change="applyFilter"><option value="">Semua Status</option><option value="active">Aktif</option><option value="draft">Draft</option><option value="review">Review</option><option value="rejected">Ditolak</option></select>
        <button type="button" aria-label="Muat ulang Bank Soal" class="inline-flex items-center justify-center rounded-2xl border border-outline-variant px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-low" :disabled="bank.isLoading" @click="refresh"><RefreshCw class="h-4 w-4" :class="bank.isLoading ? 'animate-spin' : ''" /></button>
      </div>
      <select v-model="bank.filters.category" aria-label="Filter kategori" :disabled="!bank.categories.length" class="mb-5 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm disabled:opacity-50 sm:w-auto" @change="applyFilter"><option value="">{{ bank.categories.length ? 'Semua Kategori' : 'Kategori belum tersedia' }}</option><option v-for="category in bank.categories" :key="category.id ?? category.name" :value="category.id ?? category.name">{{ category.name ?? category.nama }}</option></select>

      <div v-if="bank.isLoading" class="space-y-3" aria-label="Memuat soal"><div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-2xl bg-surface-container-low" /></div>
      <div v-else-if="bank.error" role="alert" class="flex flex-col items-center py-12 text-center"><AlertCircle class="mb-3 h-9 w-9 text-danger-rose" /><h2 class="font-title-md text-title-md text-on-surface">Gagal memuat Bank Soal</h2><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">{{ bank.error }}</p><button type="button" class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white" @click="refresh"><RefreshCw class="h-4 w-4" />Coba Lagi</button></div>
      <div v-else-if="!bank.questions.length" class="flex flex-col items-center py-12 text-center"><BookOpenCheck class="mb-3 h-10 w-10 text-primary-container" /><h2 class="font-title-md text-title-md text-on-surface">Belum ada soal</h2><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">Mulai tambahkan soal pertama ke Bank Soal MatrIQ.</p><NuxtLink to="/question-bank/create" class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white"><Plus class="h-4 w-4" />Tambah Soal</NuxtLink></div>
      <template v-else>
        <div class="hidden min-w-0 overflow-x-auto md:block">
          <table class="w-full min-w-[800px] text-left font-body-sm text-body-sm"><thead class="border-b border-soft-blue font-caption text-caption text-outline"><tr><th class="px-3 py-3">Soal</th><th class="px-3 py-3">Subtes</th><th class="px-3 py-3">Kategori</th><th class="px-3 py-3">Kesulitan</th><th class="px-3 py-3">Status</th><th class="px-3 py-3">Dibuat Oleh</th><th class="px-3 py-3">Tanggal</th><th class="px-3 py-3">Aksi</th></tr></thead><tbody class="divide-y divide-soft-blue"><tr v-for="(item, index) in bank.questions" :key="questionId(item) ?? index" class="hover:bg-surface-container-low"><td class="max-w-[280px] px-3 py-4"><p class="line-clamp-2 font-semibold text-on-surface">{{ questionText(item) }}</p></td><td class="px-3 py-4 text-on-surface-variant">{{ subtestCode(item) }}</td><td class="px-3 py-4 text-on-surface-variant">{{ categoryName(item) }}</td><td class="px-3 py-4 text-on-surface-variant">{{ difficultyLabel(item) }}</td><td class="px-3 py-4"><span class="rounded-full px-2.5 py-1 font-caption text-caption" :class="statusClass(item)">{{ statusLabel(item) }}</span></td><td class="px-3 py-4 text-on-surface-variant"><span class="block">{{ creatorName(item) }}</span><span class="mt-1 inline-flex rounded-full bg-pale-blue px-2 py-0.5 text-[10px] text-primary-container">{{ creatorRole(item) }}</span></td><td class="px-3 py-4 text-on-surface-variant">{{ formatDate(item.created_at) }}</td><td class="relative px-3 py-4"><button type="button" :aria-label="`Aksi soal ${questionId(item) ?? index}`" class="rounded-xl p-2 text-on-surface-variant hover:bg-surface-container" @click="menuId = menuId === (questionId(item) ?? index) ? null : (questionId(item) ?? index)"><EllipsisVertical class="h-4 w-4" /></button><div v-if="menuId === (questionId(item) ?? index)" class="absolute right-3 top-12 z-20 min-w-36 rounded-2xl border border-soft-blue bg-white p-1 shadow-lg"><button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low" @click="selectAction(item, 'view')"><Eye class="h-4 w-4" />Lihat Detail</button><button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low" @click="selectAction(item, 'edit')"><Pencil class="h-4 w-4" />Edit</button><button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-danger-rose hover:bg-danger-soft" @click="selectAction(item, 'delete')"><Trash2 class="h-4 w-4" />Hapus</button></div></td></tr></tbody></table>
        </div>
        <div class="space-y-3 md:hidden"><article v-for="(item, index) in bank.questions" :key="questionId(item) ?? index" class="relative rounded-2xl border border-soft-blue p-4"><div class="flex items-start justify-between gap-2"><h3 class="line-clamp-2 min-w-0 font-label-md text-label-md text-on-surface">{{ questionText(item) }}</h3><button type="button" :aria-label="`Aksi soal ${questionId(item) ?? index}`" class="shrink-0 rounded-xl p-2 text-on-surface-variant" @click="menuId = menuId === (questionId(item) ?? index) ? null : (questionId(item) ?? index)"><EllipsisVertical class="h-4 w-4" /></button></div><div class="mt-3 flex flex-wrap gap-2 font-caption text-caption"><span class="rounded-full bg-pale-blue px-2.5 py-1 text-primary-container">{{ subtestCode(item) }}</span><span class="rounded-full bg-surface-container px-2.5 py-1 text-outline">{{ categoryName(item) }}</span><span class="rounded-full bg-surface-container px-2.5 py-1 text-outline">{{ difficultyLabel(item) }}</span><span class="rounded-full px-2.5 py-1" :class="statusClass(item)">{{ statusLabel(item) }}</span></div><p class="mt-2 text-xs text-outline">Dibuat oleh {{ creatorName(item) }} · {{ creatorRole(item) }}</p><div v-if="menuId === (questionId(item) ?? index)" class="absolute right-3 top-12 z-20 min-w-36 rounded-2xl border border-soft-blue bg-white p-1 shadow-lg"><button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-body-sm" @click="selectAction(item, 'view')"><Eye class="h-4 w-4" />Lihat Detail</button><button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-body-sm" @click="selectAction(item, 'edit')"><Pencil class="h-4 w-4" />Edit</button><button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-body-sm text-danger-rose" @click="selectAction(item, 'delete')"><Trash2 class="h-4 w-4" />Hapus</button></div></article></div>
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-soft-blue pt-4 font-caption text-caption text-outline"><span>Menampilkan {{ startRow }}–{{ endRow }} dari {{ bank.pagination.total }} soal</span><div class="flex items-center gap-2"><button type="button" aria-label="Halaman sebelumnya" class="rounded-xl border border-soft-blue p-2 disabled:opacity-40" :disabled="bank.pagination.page <= 1" @click="changePage(bank.pagination.page - 1)"><ChevronLeft class="h-4 w-4" /></button><span>Halaman {{ bank.pagination.page }} / {{ bank.pagination.totalPages }}</span><button type="button" aria-label="Halaman berikutnya" class="rounded-xl border border-soft-blue p-2 disabled:opacity-40" :disabled="bank.pagination.page >= bank.pagination.totalPages" @click="changePage(bank.pagination.page + 1)"><ChevronRight class="h-4 w-4" /></button></div></div>
      </template>
    </section>

    <div v-if="deleteTarget" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" @click.self="deleteTarget = null"><div role="alertdialog" aria-modal="true" aria-label="Konfirmasi hapus soal" class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 class="font-title-md text-title-md text-on-surface">Hapus soal?</h2><p class="mt-2 font-body-sm text-body-sm text-on-surface-variant">Soal ini akan dihapus permanen.</p><p v-if="actionError" role="alert" class="mt-3 font-body-sm text-body-sm text-danger-rose">{{ actionError }}</p><div class="mt-6 flex justify-end gap-2"><button type="button" class="rounded-xl border border-soft-blue px-4 py-2.5 font-label-sm text-label-sm" @click="deleteTarget = null">Batal</button><button type="button" :disabled="actionBusy" class="inline-flex items-center gap-2 rounded-xl bg-danger-rose px-4 py-2.5 font-label-sm text-label-sm text-white disabled:opacity-60" @click="confirmDelete"><LoaderCircle v-if="actionBusy" class="h-4 w-4 animate-spin" />Hapus Soal</button></div></div></div>

    <ImportQuestionsModal v-if="showImport" @close="showImport = false" @imported="refresh" />
  </div>
</template>
