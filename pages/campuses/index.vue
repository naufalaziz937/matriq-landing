<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import {
  AlertCircle, Building2, Check, ChevronLeft, ChevronRight, GraduationCap,
  LoaderCircle, MapPin, Pencil, Plus, RefreshCw, Search, University, Users, X,
} from 'lucide-vue-next';
import { useAuthStore } from '~/stores/api/auth';
import { useCampusesStore } from '~/stores/api/campuses';
import { canAccessPage, ROLES } from '~/utils/roles';
import { useBodyScrollLock } from '~/composables/useBodyScrollLock';

definePageMeta({ layout: 'default' });
type Campus = { id: number; nama: string; singkatan: string; jenis: string; kota: string; provinsi_kode: string; aktif: boolean; prodi_count?: number };
type Program = { kode_snbt: string; kampus_id: number; nama: string; daya_tampung_2024: number | null; peminat_2023: number | null; sumber_tahun: number; aktif: boolean };
const authStore = useAuthStore();
const store = useCampusesStore();
const ready = ref(false);
const notice = ref('');
const actionError = ref('');
const showCampusForm = ref(false);
const showProgramForm = ref(false);
const anyFormOpen = computed(() => showCampusForm.value || showProgramForm.value);
useBodyScrollLock(anyFormOpen);
const editingCampus = ref<Campus | null>(null);
const editingProgram = ref<Program | null>(null);
const cityToRestore = ref('');
const campusForm = reactive({ nama: '', singkatan: '', jenis: '', kota: '', provinsi_kode: '', aktif: true });
const programForm = reactive({ kode_snbt: '', nama: '', daya_tampung_2024: '', peminat_2023: '', sumber_tahun: '2024', aktif: true });
let campusSearchTimer: ReturnType<typeof setTimeout> | undefined;
let programSearchTimer: ReturnType<typeof setTimeout> | undefined;

const cards = computed(() => [
  { label: 'Total Kampus', value: store.summary.campuses, icon: University, tone: 'bg-pale-blue text-primary-container' },
  { label: 'Kampus Aktif', value: store.summary.activeCampuses, icon: Building2, tone: 'bg-success-soft text-success-emerald' },
  { label: 'Total Prodi', value: store.summary.programs, icon: GraduationCap, tone: 'bg-soft-orange text-on-secondary-container' },
  { label: 'Prodi Aktif', value: store.summary.activePrograms, icon: Users, tone: 'bg-accent-purple-soft text-accent-purple' },
]);
const campusStart = computed(() => store.campusPagination.total ? (store.campusPagination.page - 1) * store.campusPagination.limit + 1 : 0);
const campusEnd = computed(() => Math.min(store.campusPagination.page * store.campusPagination.limit, store.campusPagination.total));
const programStart = computed(() => store.programPagination.total ? (store.programPagination.page - 1) * store.programPagination.limit + 1 : 0);
const programEnd = computed(() => Math.min(store.programPagination.page * store.programPagination.limit, store.programPagination.total));
const selected = computed(() => store.selectedCampus as Campus | null);

function errorText(error: any, fallback: string) { return error?.data?.message || error?.message || fallback; }
async function refresh() { await Promise.all([store.fetchCampuses(), store.fetchSummary()]); }
function applyCampusFilter() { store.campusPagination.page = 1; store.fetchCampuses(); }
function applyProgramFilter() { store.programPagination.page = 1; store.fetchPrograms(); }
function campusPage(next: number) {
  if (next < 1 || next > store.campusPagination.totalPages) return;
  store.campusPagination.page = next;
  store.fetchCampuses();
}
function programPage(next: number) {
  if (next < 1 || next > store.programPagination.totalPages) return;
  store.programPagination.page = next;
  store.fetchPrograms();
}
function openCreateCampus() {
  editingCampus.value = null;
  cityToRestore.value = '';
  Object.assign(campusForm, { nama: '', singkatan: '', jenis: '', kota: '', provinsi_kode: '', aktif: true });
  actionError.value = '';
  showCampusForm.value = true;
}
function openEditCampus(item: Campus) {
  editingCampus.value = item;
  cityToRestore.value = item.kota;
  Object.assign(campusForm, { nama: item.nama, singkatan: item.singkatan, jenis: item.jenis, kota: item.kota, provinsi_kode: item.provinsi_kode, aktif: item.aktif });
  actionError.value = '';
  showCampusForm.value = true;
}
async function saveCampus() {
  if (store.isSubmitting) return;
  actionError.value = '';
  try {
    const response: any = editingCampus.value
      ? await store.updateCampus(editingCampus.value.id, { ...campusForm })
      : await store.createCampus({ ...campusForm });
    const created = !editingCampus.value;
    notice.value = created ? 'Kampus berhasil ditambahkan.' : 'Kampus berhasil diperbarui.';
    showCampusForm.value = false;
    await refresh();
    if (created && response?.data) store.selectCampus(response.data);
    else if (selected.value?.id === response?.data?.id) store.selectedCampus = response.data;
  } catch (error) { actionError.value = errorText(error, 'Gagal menyimpan kampus.'); }
}
async function toggleCampus(item: Campus) {
  actionError.value = '';
  try {
    await store.updateCampus(item.id, { aktif: !item.aktif });
    notice.value = item.aktif ? 'Kampus dinonaktifkan.' : 'Kampus diaktifkan.';
    await refresh();
  } catch (error) { actionError.value = errorText(error, 'Gagal mengubah status kampus.'); }
}
function openCreateProgram() {
  editingProgram.value = null;
  Object.assign(programForm, { kode_snbt: '', nama: '', daya_tampung_2024: '', peminat_2023: '', sumber_tahun: '2024', aktif: true });
  actionError.value = '';
  showProgramForm.value = true;
}
function openEditProgram(item: Program) {
  editingProgram.value = item;
  Object.assign(programForm, { kode_snbt: item.kode_snbt, nama: item.nama, daya_tampung_2024: item.daya_tampung_2024 ?? '', peminat_2023: item.peminat_2023 ?? '', sumber_tahun: String(item.sumber_tahun), aktif: item.aktif });
  actionError.value = '';
  showProgramForm.value = true;
}
async function saveProgram() {
  if (!selected.value || store.isSubmitting) return;
  actionError.value = '';
  try {
    const body = { ...programForm };
    if (editingProgram.value) await store.updateProgram(selected.value.id, editingProgram.value.kode_snbt, body);
    else await store.createProgram(selected.value.id, body);
    notice.value = editingProgram.value ? 'Prodi berhasil diperbarui.' : 'Prodi berhasil ditambahkan.';
    showProgramForm.value = false;
    await Promise.all([store.fetchPrograms(), store.fetchSummary(), store.fetchCampuses()]);
  } catch (error) { actionError.value = errorText(error, 'Gagal menyimpan prodi.'); }
}
async function toggleProgram(item: Program) {
  if (!selected.value) return;
  actionError.value = '';
  try {
    await store.updateProgram(selected.value.id, item.kode_snbt, { aktif: !item.aktif });
    notice.value = item.aktif ? 'Prodi dinonaktifkan.' : 'Prodi diaktifkan.';
    await Promise.all([store.fetchPrograms(), store.fetchSummary()]);
  } catch (error) { actionError.value = errorText(error, 'Gagal mengubah status prodi.'); }
}

watch(() => campusForm.provinsi_kode, async (code) => {
  const restore = cityToRestore.value;
  campusForm.kota = '';
  await store.fetchCities(code);
  if (restore) {
    const city = store.cities.find((item: any) => item.label === restore || item.nama === restore);
    if (city) campusForm.kota = city.label;
    cityToRestore.value = '';
  }
});
watch(() => store.campusFilters.search, () => { clearTimeout(campusSearchTimer); campusSearchTimer = setTimeout(applyCampusFilter, 350); });
watch(() => store.programFilters.search, () => { clearTimeout(programSearchTimer); programSearchTimer = setTimeout(applyProgramFilter, 350); });
onBeforeUnmount(() => { clearTimeout(campusSearchTimer); clearTimeout(programSearchTimer); });
onMounted(async () => {
  authStore.initializeAuth();
  if (!authStore.token) return navigateTo('/login');
  const user = await authStore.fetchCurrentUser();
  if (Number(user?.role) !== ROLES.ADMIN || !canAccessPage(user?.role, 'campuses')) return navigateTo('/dashboard');
  ready.value = true;
  await Promise.all([refresh(), store.fetchProvinces()]);
});
</script>

<template>
  <div v-if="ready" class="mx-auto w-full max-w-[1536px] min-w-0 px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10">
    <header class="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h1 class="font-headline-md text-headline-md text-on-surface">Kampus &amp; Prodi</h1><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">Kelola master data kampus PTN dan program studi.</p></div><button v-if="canAccessPage(authStore.user?.role, 'campuses.create')" type="button" class="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white hover:bg-brand-700" @click="openCreateCampus"><Plus class="h-4 w-4" />Tambah Kampus</button></header>
    <section class="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Ringkasan kampus dan prodi"><article v-for="card in cards" :key="card.label" class="rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-5"><div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl" :class="card.tone"><component :is="card.icon" class="h-[22px] w-[22px]" /></div><p class="font-caption text-caption text-outline">{{ card.label }}</p><div v-if="store.isLoading" class="mt-2 h-8 w-16 animate-pulse rounded-lg bg-surface-container" /><p v-else class="mt-1 font-headline-md text-headline-md text-on-surface">{{ card.value ?? '—' }}</p></article></section>
    <p v-if="notice" role="status" class="mb-4 flex items-center gap-2 rounded-2xl bg-success-soft px-4 py-3 font-body-sm text-body-sm text-success-emerald"><Check class="h-4 w-4" />{{ notice }}</p><p v-if="actionError && !showCampusForm && !showProgramForm" role="alert" class="mb-4 flex items-center gap-2 rounded-2xl bg-danger-soft px-4 py-3 font-body-sm text-body-sm text-danger-rose"><AlertCircle class="h-4 w-4" />{{ actionError }}</p>
    <section class="mb-5 min-w-0 rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-6"><div class="mb-5 flex flex-col gap-3 sm:flex-row"><label class="relative min-w-0 flex-1"><Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" /><input v-model="store.campusFilters.search" type="search" placeholder="Cari kampus, singkatan, atau kota..." class="w-full rounded-2xl border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-3 font-body-sm text-body-sm outline-none focus:border-primary-container"></label><select v-model="store.campusFilters.status" aria-label="Filter status kampus" class="rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm" @change="applyCampusFilter"><option value="">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select><button type="button" aria-label="Muat ulang kampus" class="inline-flex items-center justify-center rounded-2xl border border-outline-variant px-3 py-2.5" :disabled="store.isLoading" @click="refresh"><RefreshCw class="h-4 w-4" :class="store.isLoading ? 'animate-spin' : ''" /></button></div><h2 class="mb-4 font-title-md text-title-md text-on-surface">Daftar Kampus</h2>
      <div v-if="store.isLoading" class="space-y-3" aria-label="Memuat kampus"><div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-2xl bg-surface-container-low" /></div><div v-else-if="store.error" role="alert" class="py-12 text-center"><AlertCircle class="mx-auto mb-3 h-9 w-9 text-danger-rose" /><p class="font-body-sm text-body-sm text-on-surface">{{ store.error }}</p><button type="button" class="mt-4 font-label-sm text-label-sm text-primary-container" @click="refresh">Coba Lagi</button></div><div v-else-if="!store.campuses.length" class="py-12 text-center"><University class="mx-auto mb-3 h-10 w-10 text-primary-container" /><p class="font-title-md text-title-md text-on-surface">Kampus tidak ditemukan</p></div>
      <template v-else><div class="hidden min-w-0 overflow-x-auto md:block"><table class="w-full min-w-[700px] text-left font-body-sm text-body-sm"><thead class="border-b border-soft-blue font-caption text-caption text-outline"><tr><th class="px-3 py-3">Kampus</th><th class="px-3 py-3">Jenis</th><th class="px-3 py-3">Kota</th><th class="px-3 py-3">Prodi</th><th class="px-3 py-3">Status</th><th class="px-3 py-3">Aksi</th></tr></thead><tbody class="divide-y divide-soft-blue"><tr v-for="item in store.campuses" :key="item.id" class="cursor-pointer hover:bg-surface-container-low" :class="selected?.id === item.id ? 'bg-pale-blue' : ''" @click="store.selectCampus(item)"><td class="px-3 py-4"><div class="flex items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pale-blue text-primary-container"><University class="h-5 w-5" /></span><span><strong class="block text-on-surface">{{ item.nama }}</strong><small class="font-caption text-caption text-outline">{{ item.singkatan }}</small></span></div></td><td class="px-3 py-4 text-on-surface-variant">{{ item.jenis }}</td><td class="px-3 py-4 text-on-surface-variant">{{ item.kota }}</td><td class="px-3 py-4 text-on-surface-variant">{{ item.prodi_count }}</td><td class="px-3 py-4"><span class="rounded-full px-2.5 py-1 font-caption text-caption" :class="item.aktif ? 'bg-success-soft text-success-emerald' : 'bg-surface-container text-outline'">{{ item.aktif ? 'Aktif' : 'Nonaktif' }}</span></td><td class="px-3 py-4"><div class="flex gap-2"><button type="button" :aria-label="`Edit ${item.nama}`" class="rounded-xl p-2 text-primary-container hover:bg-pale-blue" @click.stop="openEditCampus(item)"><Pencil class="h-4 w-4" /></button><button type="button" :aria-label="`${item.aktif ? 'Nonaktifkan' : 'Aktifkan'} ${item.nama}`" class="rounded-xl border border-soft-blue px-2.5 py-1 font-caption text-caption text-on-surface-variant" @click.stop="toggleCampus(item)">{{ item.aktif ? 'Nonaktifkan' : 'Aktifkan' }}</button></div></td></tr></tbody></table></div><div class="space-y-3 md:hidden"><article v-for="item in store.campuses" :key="item.id" class="rounded-2xl border p-4" :class="selected?.id === item.id ? 'border-primary-container bg-pale-blue' : 'border-soft-blue'"><button type="button" class="w-full text-left" @click="store.selectCampus(item)"><h3 class="font-label-md text-label-md text-on-surface">{{ item.nama }}</h3><p class="mt-1 font-caption text-caption text-outline">{{ item.singkatan }} · {{ item.jenis }} · {{ item.kota }}</p><p class="mt-2 font-caption text-caption text-on-surface-variant">{{ item.prodi_count }} prodi · {{ item.aktif ? 'Aktif' : 'Nonaktif' }}</p></button><div class="mt-3 flex gap-2"><button type="button" class="rounded-xl border border-soft-blue px-3 py-2 font-caption text-caption" @click="openEditCampus(item)">Edit</button><button type="button" class="rounded-xl border border-soft-blue px-3 py-2 font-caption text-caption" @click="toggleCampus(item)">{{ item.aktif ? 'Nonaktifkan' : 'Aktifkan' }}</button></div></article></div><div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-soft-blue pt-4 font-caption text-caption text-outline"><span>Menampilkan {{ campusStart }}–{{ campusEnd }} dari {{ store.campusPagination.total }} kampus</span><div class="flex items-center gap-2"><button type="button" aria-label="Halaman kampus sebelumnya" class="rounded-xl border border-soft-blue p-2 disabled:opacity-40" :disabled="store.campusPagination.page <= 1" @click="campusPage(store.campusPagination.page - 1)"><ChevronLeft class="h-4 w-4" /></button><span>{{ store.campusPagination.page }} / {{ store.campusPagination.totalPages }}</span><button type="button" aria-label="Halaman kampus berikutnya" class="rounded-xl border border-soft-blue p-2 disabled:opacity-40" :disabled="store.campusPagination.page >= store.campusPagination.totalPages" @click="campusPage(store.campusPagination.page + 1)"><ChevronRight class="h-4 w-4" /></button></div></div></template>
    </section>
    <section class="min-w-0 rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-6"><div class="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 class="font-title-md text-title-md text-on-surface">Program Studi</h2><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">{{ selected ? `${selected.nama} (${selected.singkatan})` : 'Pilih kampus dari daftar di atas.' }}</p></div><button v-if="selected && canAccessPage(authStore.user?.role, 'programs.create')" type="button" class="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white" @click="openCreateProgram"><Plus class="h-4 w-4" />Tambah Prodi</button></div>
      <template v-if="selected"><div class="mb-5 flex flex-col gap-3 sm:flex-row"><label class="relative min-w-0 flex-1"><Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" /><input v-model="store.programFilters.search" type="search" placeholder="Cari nama atau kode prodi..." class="w-full rounded-2xl border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-3 font-body-sm text-body-sm" /></label><select v-model="store.programFilters.status" aria-label="Filter status prodi" class="rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm" @change="applyProgramFilter"><option value="">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div><div v-if="store.isLoadingPrograms" class="space-y-3" aria-label="Memuat prodi"><div v-for="n in 4" :key="n" class="h-14 animate-pulse rounded-2xl bg-surface-container-low" /></div><div v-else-if="store.programError" role="alert" class="py-10 text-center"><p class="font-body-sm text-body-sm text-danger-rose">{{ store.programError }}</p><button type="button" class="mt-3 font-label-sm text-label-sm text-primary-container" @click="store.fetchPrograms()">Coba Lagi</button></div><div v-else-if="!store.programs.length" class="py-10 text-center"><GraduationCap class="mx-auto mb-3 h-9 w-9 text-primary-container" /><p class="font-body-sm text-body-sm text-on-surface-variant">Belum ada prodi untuk filter ini.</p></div><template v-else><div class="hidden min-w-0 overflow-x-auto md:block"><table class="w-full min-w-[700px] text-left font-body-sm text-body-sm"><thead class="border-b border-soft-blue font-caption text-caption text-outline"><tr><th class="px-3 py-3">Kode SNBT</th><th class="px-3 py-3">Program Studi</th><th class="px-3 py-3">Daya Tampung 2024</th><th class="px-3 py-3">Peminat 2023</th><th class="px-3 py-3">Status</th><th class="px-3 py-3">Aksi</th></tr></thead><tbody class="divide-y divide-soft-blue"><tr v-for="item in store.programs" :key="item.kode_snbt" class="hover:bg-surface-container-low"><td class="px-3 py-4 font-semibold text-primary-container">{{ item.kode_snbt }}</td><td class="px-3 py-4 font-semibold text-on-surface">{{ item.nama }}</td><td class="px-3 py-4 text-on-surface-variant">{{ item.daya_tampung_2024 ?? '—' }}</td><td class="px-3 py-4 text-on-surface-variant">{{ item.peminat_2023 ?? '—' }}</td><td class="px-3 py-4"><span class="rounded-full px-2.5 py-1 font-caption text-caption" :class="item.aktif ? 'bg-success-soft text-success-emerald' : 'bg-surface-container text-outline'">{{ item.aktif ? 'Aktif' : 'Nonaktif' }}</span></td><td class="px-3 py-4"><div class="flex gap-2"><button type="button" :aria-label="`Edit ${item.nama}`" class="rounded-xl p-2 text-primary-container" @click="openEditProgram(item)"><Pencil class="h-4 w-4" /></button><button type="button" class="rounded-xl border border-soft-blue px-2.5 py-1 font-caption text-caption text-on-surface-variant" @click="toggleProgram(item)">{{ item.aktif ? 'Nonaktifkan' : 'Aktifkan' }}</button></div></td></tr></tbody></table></div><div class="space-y-3 md:hidden"><article v-for="item in store.programs" :key="item.kode_snbt" class="rounded-2xl border border-soft-blue p-4"><h3 class="font-label-md text-label-md text-on-surface">{{ item.nama }}</h3><p class="mt-1 font-caption text-caption text-primary-container">{{ item.kode_snbt }}</p><p class="mt-2 font-caption text-caption text-on-surface-variant">Daya tampung: {{ item.daya_tampung_2024 ?? '—' }} · Peminat: {{ item.peminat_2023 ?? '—' }} · {{ item.aktif ? 'Aktif' : 'Nonaktif' }}</p><div class="mt-3 flex gap-2"><button type="button" class="rounded-xl border border-soft-blue px-3 py-2 font-caption text-caption" @click="openEditProgram(item)">Edit</button><button type="button" class="rounded-xl border border-soft-blue px-3 py-2 font-caption text-caption" @click="toggleProgram(item)">{{ item.aktif ? 'Nonaktifkan' : 'Aktifkan' }}</button></div></article></div><div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-soft-blue pt-4 font-caption text-caption text-outline"><span>Menampilkan {{ programStart }}–{{ programEnd }} dari {{ store.programPagination.total }} prodi</span><div class="flex items-center gap-2"><button type="button" aria-label="Halaman prodi sebelumnya" class="rounded-xl border border-soft-blue p-2 disabled:opacity-40" :disabled="store.programPagination.page <= 1" @click="programPage(store.programPagination.page - 1)"><ChevronLeft class="h-4 w-4" /></button><span>{{ store.programPagination.page }} / {{ store.programPagination.totalPages }}</span><button type="button" aria-label="Halaman prodi berikutnya" class="rounded-xl border border-soft-blue p-2 disabled:opacity-40" :disabled="store.programPagination.page >= store.programPagination.totalPages" @click="programPage(store.programPagination.page + 1)"><ChevronRight class="h-4 w-4" /></button></div></div></template></template>
    </section>
    <div v-if="showCampusForm" class="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden overscroll-contain bg-slate-950/50 p-4" @click.self="showCampusForm = false"><div role="dialog" aria-modal="true" :aria-label="editingCampus ? 'Edit kampus' : 'Tambah kampus'" class="max-h-[90dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-2xl sm:p-6"><div class="mb-5 flex items-center justify-between"><h2 class="font-title-md text-title-md text-on-surface">{{ editingCampus ? 'Edit Kampus' : 'Tambah Kampus' }}</h2><button type="button" aria-label="Tutup formulir" class="rounded-xl p-2 text-on-surface-variant" @click="showCampusForm = false"><X class="h-5 w-5" /></button></div><form class="space-y-4" @submit.prevent="saveCampus"><label class="block font-label-sm text-label-sm text-on-surface">Nama Kampus<input v-model="campusForm.nama" required maxlength="150" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"></label><div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><label class="font-label-sm text-label-sm text-on-surface">Singkatan<input v-model="campusForm.singkatan" required maxlength="20" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"></label><label class="font-label-sm text-label-sm text-on-surface">Jenis<input v-model="campusForm.jenis" required maxlength="30" list="campus-types" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"><datalist id="campus-types"><option value="Universitas" /><option value="Institut" /><option value="Institut Seni" /><option value="Politeknik" /><option value="UIN" /></datalist></label><label class="font-label-sm text-label-sm text-on-surface">Provinsi<select v-model="campusForm.provinsi_kode" required class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"><option value="" disabled>Pilih provinsi</option><option v-for="item in store.provinces" :key="item.kode" :value="item.kode">{{ item.nama }}</option></select></label><label class="font-label-sm text-label-sm text-on-surface">Kota/Kabupaten<select v-model="campusForm.kota" required :disabled="!campusForm.provinsi_kode || store.isLoadingCities" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm disabled:opacity-60"><option value="" disabled>{{ store.isLoadingCities ? 'Memuat kota/kabupaten...' : 'Pilih kota/kabupaten' }}</option><option v-for="item in store.cities" :key="item.kode" :value="item.label">{{ item.label }}</option></select><span v-if="store.locationError" class="mt-1 block text-xs text-danger-rose">{{ store.locationError }}</span></label></div><label class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface"><input v-model="campusForm.aktif" type="checkbox" class="h-4 w-4 accent-primary-container">Aktif dan tampil di pilihan siswa</label><p v-if="actionError" role="alert" class="font-body-sm text-body-sm text-danger-rose">{{ actionError }}</p><div class="flex justify-end gap-2"><button type="button" class="rounded-xl border border-soft-blue px-4 py-2.5 font-label-sm text-label-sm" @click="showCampusForm = false">Batal</button><button type="submit" :disabled="store.isSubmitting" class="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white disabled:opacity-60"><LoaderCircle v-if="store.isSubmitting" class="h-4 w-4 animate-spin" />Simpan Kampus</button></div></form></div></div>
    <div v-if="showProgramForm" class="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden overscroll-contain bg-slate-950/50 p-4" @click.self="showProgramForm = false"><div role="dialog" aria-modal="true" :aria-label="editingProgram ? 'Edit prodi' : 'Tambah prodi'" class="max-h-[90dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-2xl sm:p-6"><div class="mb-5 flex items-center justify-between"><div><h2 class="font-title-md text-title-md text-on-surface">{{ editingProgram ? 'Edit Prodi' : 'Tambah Prodi' }}</h2><p class="mt-1 font-caption text-caption text-outline">{{ selected?.nama }}</p></div><button type="button" aria-label="Tutup formulir" class="rounded-xl p-2 text-on-surface-variant" @click="showProgramForm = false"><X class="h-5 w-5" /></button></div><form class="space-y-4" @submit.prevent="saveProgram"><div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><label class="font-label-sm text-label-sm text-on-surface">Kode SNBT<input v-model="programForm.kode_snbt" required maxlength="10" :disabled="!!editingProgram" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm disabled:opacity-60"></label><label class="font-label-sm text-label-sm text-on-surface">Tahun Sumber<input v-model="programForm.sumber_tahun" type="number" required min="2000" max="2100" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"></label></div><label class="block font-label-sm text-label-sm text-on-surface">Nama Program Studi<input v-model="programForm.nama" required maxlength="180" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"></label><div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><label class="font-label-sm text-label-sm text-on-surface">Daya Tampung 2024<input v-model="programForm.daya_tampung_2024" type="number" min="0" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"></label><label class="font-label-sm text-label-sm text-on-surface">Peminat 2023<input v-model="programForm.peminat_2023" type="number" min="0" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"></label></div><label class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface"><input v-model="programForm.aktif" type="checkbox" class="h-4 w-4 accent-primary-container">Aktif dan tampil di pilihan siswa</label><p v-if="actionError" role="alert" class="font-body-sm text-body-sm text-danger-rose">{{ actionError }}</p><div class="flex justify-end gap-2"><button type="button" class="rounded-xl border border-soft-blue px-4 py-2.5 font-label-sm text-label-sm" @click="showProgramForm = false">Batal</button><button type="submit" :disabled="store.isSubmitting" class="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white disabled:opacity-60"><LoaderCircle v-if="store.isSubmitting" class="h-4 w-4 animate-spin" />Simpan Prodi</button></div></form></div></div>
  </div>
</template>


