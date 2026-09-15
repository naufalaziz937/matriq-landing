<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { ClipboardList, Users, ChartNoAxesCombined, Trophy, Download, Search, TrendingUp, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useAdminTryoutRecapStore } from '~/stores/api/adminTryoutRecap';
import { useAuthStore } from '~/stores/api/auth';
import { canAccessPage } from '~/utils/roles';

const store = useAdminTryoutRecapStore();
const auth = useAuthStore();
const campuses = ref([]);
const programs = ref([]);
const detailOpen = ref(false);
const ready = ref(false);
let timer;
const card = 'min-w-0 rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-6';
const input = 'min-w-0 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary-container';
const metrics = computed(() => [
  { label: 'Total Rekap', value: store.summary?.total_recap, icon: ClipboardList, tone: 'bg-pale-blue text-primary-container' },
  { label: 'User Ikut Tryout', value: store.summary?.total_users, icon: Users, tone: 'bg-success-soft text-success' },
  { label: 'Rata-rata Skor', value: formatScore(store.summary?.average_score), icon: ChartNoAxesCombined, tone: 'bg-soft-orange text-orange-600' },
  { label: 'Skor Tertinggi', value: formatScore(store.summary?.highest_score), icon: Trophy, tone: 'bg-pale-blue text-primary-container' },
]);
const platformMax = computed(() => Math.max(1, ...store.platformStats.map(x => Number(x.total) || 0)));
const distributionMax = computed(() => Math.max(1, ...store.distribution.map(x => Number(x.total) || 0)));
const subtests = computed(() => Object.entries(store.subtestStats || {}).filter(([, value]) => value !== null).map(([key, value]) => ({ key: key.toUpperCase(), value: Number(value) })).sort((a, b) => b.value - a.value));
function formatScore(value) { return value == null ? '—' : Number(value).toLocaleString('id-ID', { maximumFractionDigits: 1 }); }
function formatDate(value) { return value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
function target(row) { return [row?.campus_short || row?.campus_name, row?.prodi_name].filter(Boolean).join(' · ') || 'Target belum tersedia'; }
async function loadMaster() {
  try {
    const result = await store.request('/kampus', { query: { limit: 500 } });
    campuses.value = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
  } catch { campuses.value = []; }
}
async function loadPrograms() {
  programs.value = [];
  if (!store.filters.campus_id) return;
  try {
    const result = await store.request(`/admin/campuses/${store.filters.campus_id}/prodi`, { query: { limit: 500 } });
    programs.value = Array.isArray(result?.data) ? result.data : [];
  } catch { programs.value = []; }
}
function applyFilters() {
  store.pagination.page = 1;
  store.fetchRecaps().catch(() => { store.error = 'Gagal memuat data rekap tryout.'; });
  store.fetchRanking().catch(() => { store.error = 'Gagal memuat ranking.'; });
}
watch(() => store.filters.search, () => { clearTimeout(timer); timer = setTimeout(applyFilters, 350); });
watch(() => store.filters.campus_id, async () => { store.filters.prodi_code = ''; await loadPrograms(); applyFilters(); });
watch(() => [store.filters.platform, store.filters.prodi_code, store.filters.date_from, store.filters.date_to, store.filters.sort], applyFilters);
async function changePage(page) { store.pagination.page = page; try { await store.fetchRecaps(); } catch { store.error = 'Gagal memuat data rekap tryout.'; } }
async function openDetail(id) { detailOpen.value = true; await store.fetchUserDetail(id); }
onMounted(async () => {
  auth.initializeAuth();
  if (!auth.token) return navigateTo('/login');
  const user = await auth.fetchCurrentUser();
  if (Number(user?.role) !== 1 || !canAccessPage(user?.role, 'tryout-recap')) return navigateTo('/dashboard');
  ready.value = true;
  await Promise.all([store.fetchAll(), loadMaster()]);
});
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
    <template v-if="ready && Number(auth.user?.role) === 1">
      <header class="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div><h1 class="font-headline-md text-headline-md text-on-surface">Rekap Tryout</h1><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">Analisis hasil tryout user dari berbagai platform dan pantau perkembangan skor mereka.</p></div>
        <NuxtLink to="/reports?type=tryout-recap" class="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white hover:bg-brand-700"><Download class="h-4 w-4" />Export Data</NuxtLink>
      </header>
      <div v-if="store.error" role="alert" class="mb-5 flex items-center gap-3 rounded-2xl border border-soft-blue bg-surface-white p-4"><span class="flex-1">{{ store.error }}</span><button class="inline-flex items-center gap-2 text-primary-container" @click="store.fetchAll()"><RefreshCw class="h-4 w-4" />Coba Lagi</button></div>
      <section class="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Ringkasan tryout">
        <article v-for="metric in metrics" :key="metric.label" class="rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-5">
          <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl" :class="metric.tone"><component :is="metric.icon" class="h-[22px] w-[22px]" /></div>
          <p class="font-caption text-caption text-outline">{{ metric.label }}</p><div v-if="store.isLoading" class="mt-2 h-8 w-20 animate-pulse rounded-lg bg-surface-container" /><p v-else class="mt-1 font-headline-md text-headline-md text-on-surface">{{ metric.value ?? '—' }}</p>
        </article>
      </section>
      <section class="mb-5" :class="card" aria-label="Filter rekap">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label class="relative"><span class="sr-only">Cari nama user</span><Search class="pointer-events-none absolute left-3 top-3 h-4 w-4 text-outline" /><input v-model="store.filters.search" type="search" placeholder="Cari nama user..." :class="input" class="pl-9" /></label>
          <label><span class="sr-only">Platform</span><select v-model="store.filters.platform" :class="input"><option value="">Semua Platform</option><option v-for="item in store.platformStats" :key="item.platform" :value="item.platform">{{ item.platform }}</option></select></label>
          <label><span class="sr-only">Kampus target</span><select v-model="store.filters.campus_id" :class="input"><option value="">Semua Kampus</option><option v-for="campus in campuses" :key="campus.id" :value="campus.id">{{ campus.nama }}</option></select></label>
          <label><span class="sr-only">Program studi target</span><select v-model="store.filters.prodi_code" :disabled="!store.filters.campus_id" :class="input"><option value="">{{ store.filters.campus_id ? 'Semua Prodi' : 'Pilih kampus terlebih dahulu' }}</option><option v-for="prodi in programs" :key="prodi.kode_snbt" :value="prodi.kode_snbt">{{ prodi.nama }}</option></select></label>
          <label class="font-caption text-caption text-outline">Dari tanggal<input v-model="store.filters.date_from" type="date" :class="input" class="mt-1" /></label>
          <label class="font-caption text-caption text-outline">Sampai tanggal<input v-model="store.filters.date_to" type="date" :class="input" class="mt-1" /></label>
          <label class="font-caption text-caption text-outline">Urutkan<select v-model="store.filters.sort" :class="input" class="mt-1"><option value="latest">Terbaru</option><option value="oldest">Terlama</option><option value="score_desc">Skor tertinggi</option><option value="score_asc">Skor terendah</option></select></label>
        </div>
      </section>
      <div v-if="!store.isLoading && !store.summary?.total_recap" class="mb-5 rounded-3xl border border-soft-blue bg-surface-white p-10 text-center"><ClipboardList class="mx-auto mb-3 h-10 w-10 text-primary-container" /><h2 class="font-title-md text-title-md">Belum ada data rekap tryout.</h2><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">Data akan muncul setelah user mencatat hasil tryout mereka.</p></div>
      <div class="mb-5 grid min-w-0 gap-5 xl:grid-cols-3">
        <section :class="card" class="xl:col-span-2"><h2 class="mb-4 font-title-md text-title-md text-on-surface">Top Skor Tryout</h2><div v-if="store.isLoading" class="h-40 animate-pulse rounded-2xl bg-surface-container" /><p v-else-if="!store.ranking.length" class="text-on-surface-variant">Belum ada ranking untuk filter ini.</p><div v-else class="space-y-2"><button v-for="row in store.ranking" :key="row.user_id" type="button" class="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-soft-blue p-3 text-left hover:bg-surface-container-low" @click="openDetail(row.user_id)"><span class="w-8 shrink-0 text-center font-title-md text-title-md text-primary-container">{{ row.rank }}</span><img v-if="row.foto_profile" :src="row.foto_profile" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover" /><span v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pale-blue font-label-sm text-primary-container">{{ row.nama?.slice(0, 1) }}</span><span class="min-w-0 flex-1"><span class="block truncate font-label-sm text-label-sm text-on-surface">{{ row.nama }}</span><span class="block truncate font-caption text-caption text-outline">{{ target(row) }} · {{ row.platform || 'Platform tidak diketahui' }}</span><span class="block font-caption text-caption text-outline">Terakhir {{ formatScore(row.latest_score) }} · {{ row.recap_count }} rekap</span></span><strong class="shrink-0 text-primary-container">{{ formatScore(row.total_score) }}</strong></button></div></section>
        <section :class="card"><h2 class="mb-4 font-title-md text-title-md text-on-surface">Platform Tryout Terpopuler</h2><p v-if="!store.platformStats.length" class="text-on-surface-variant">Belum ada data platform.</p><div v-for="item in store.platformStats" :key="item.platform" class="mb-4"><div class="mb-1 flex justify-between gap-2 font-body-sm text-body-sm"><span class="truncate">{{ item.platform }}</span><span>{{ item.total }} rekap · {{ item.percentage }}%</span></div><div class="h-2 rounded-full bg-surface-container"><div class="h-2 rounded-full bg-primary-container" :style="{ width: `${100 * Number(item.total) / platformMax}%` }" /></div></div></section>
      </div>
      <div class="mb-5 grid min-w-0 gap-5 xl:grid-cols-2">
        <section :class="card"><h2 class="mb-4 font-title-md text-title-md text-on-surface">Distribusi Skor</h2><div v-for="item in store.distribution" :key="item.label" class="mb-3 grid grid-cols-[76px_1fr_40px] items-center gap-2 font-body-sm text-body-sm"><span>{{ item.label }}</span><div class="h-3 rounded-full bg-surface-container"><div class="h-3 rounded-full bg-primary-container" :style="{ width: `${100 * Number(item.total) / distributionMax}%` }" /></div><span class="text-right">{{ item.total }}</span></div></section>
        <section :class="card"><h2 class="mb-4 font-title-md text-title-md text-on-surface">Rata-rata Skor per Subtes</h2><p v-if="!subtests.length" class="text-on-surface-variant">Belum ada skor subtes.</p><div v-for="item in subtests" :key="item.key" class="mb-3 grid grid-cols-[36px_1fr_50px] items-center gap-2 font-body-sm text-body-sm"><span>{{ item.key }}</span><div class="h-3 rounded-full bg-surface-container"><div class="h-3 rounded-full bg-primary-container" :style="{ width: `${Math.min(100, item.value / 10)}%` }" /></div><span class="text-right">{{ formatScore(item.value) }}</span></div><p v-if="subtests.length" class="mt-4 font-caption text-caption text-outline">Terkuat: {{ subtests[0].key }} · Terlemah: {{ subtests[subtests.length - 1].key }}</p></section>
      </div>
      <section class="mb-5" :class="card"><h2 class="mb-4 font-title-md text-title-md text-on-surface">Peningkatan Terbesar</h2><p v-if="!store.mostImproved.length" class="text-on-surface-variant">Belum ada user dengan minimal dua rekap.</p><div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"><button v-for="row in store.mostImproved" :key="row.user_id" class="flex items-center gap-3 rounded-2xl border border-soft-blue p-3 text-left hover:bg-surface-container-low" @click="openDetail(row.user_id)"><TrendingUp class="h-5 w-5 text-primary-container" /><span class="min-w-0 flex-1 truncate">{{ row.nama }}</span><strong :class="Number(row.improvement) >= 0 ? 'text-success' : 'text-danger-rose'">{{ Number(row.improvement) >= 0 ? '+' : '' }}{{ formatScore(row.improvement) }}</strong></button></div></section>
      <section :class="card"><div class="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 class="font-title-md text-title-md text-on-surface">Rekap Terbaru</h2><span class="font-caption text-caption text-outline">{{ store.pagination.total }} data</span></div>
        <div v-if="store.isLoading" class="h-36 animate-pulse rounded-2xl bg-surface-container" /><p v-else-if="!store.recaps.length" class="text-on-surface-variant">Tidak ada rekap untuk filter ini.</p>
        <div v-else><div class="hidden overflow-x-auto md:block"><table class="w-full min-w-[780px] text-left font-body-sm text-body-sm"><thead class="border-b border-soft-blue text-outline"><tr><th class="p-3">User</th><th class="p-3">Platform</th><th class="p-3">Nama Tryout</th><th class="p-3">Skor</th><th class="p-3">Target</th><th class="p-3">Tanggal</th><th class="p-3">Detail</th></tr></thead><tbody><tr v-for="row in store.recaps" :key="row.recap_id" class="border-b border-soft-blue"><td class="p-3 font-label-sm text-label-sm">{{ row.nama }}</td><td class="p-3">{{ row.platform || '—' }}</td><td class="p-3">{{ row.tryout_name || '—' }}</td><td class="p-3">{{ formatScore(row.total_score) }}</td><td class="p-3">{{ target(row) }}</td><td class="p-3">{{ formatDate(row.recap_at) }}</td><td class="p-3"><button class="text-primary-container hover:underline" @click="openDetail(row.user_id)">Lihat</button></td></tr></tbody></table></div>
        <div class="space-y-3 md:hidden"><button v-for="row in store.recaps" :key="row.recap_id" class="w-full rounded-2xl border border-soft-blue p-3 text-left" @click="openDetail(row.user_id)"><span class="flex justify-between gap-3"><strong class="truncate">{{ row.nama }}</strong><strong class="text-primary-container">{{ formatScore(row.total_score) }}</strong></span><span class="mt-1 block text-on-surface-variant">{{ row.platform || '—' }} · {{ row.tryout_name || '—' }}</span><span class="block truncate text-outline">{{ target(row) }} · {{ formatDate(row.recap_at) }}</span></button></div></div>
        <div class="mt-4 flex items-center justify-end gap-3 font-body-sm text-body-sm"><span>Halaman {{ store.pagination.page }} / {{ store.pagination.total_pages }}</span><button :disabled="store.pagination.page <= 1" aria-label="Halaman sebelumnya" class="rounded-xl border border-soft-blue p-2 disabled:opacity-40" @click="changePage(store.pagination.page - 1)"><ChevronLeft class="h-4 w-4" /></button><button :disabled="store.pagination.page >= store.pagination.total_pages" aria-label="Halaman berikutnya" class="rounded-xl border border-soft-blue p-2 disabled:opacity-40" @click="changePage(store.pagination.page + 1)"><ChevronRight class="h-4 w-4" /></button></div>
      </section>
      <div v-if="detailOpen" class="fixed inset-0 z-50 flex justify-end bg-black/40" @click.self="detailOpen = false"><div role="dialog" aria-modal="true" aria-label="Detail perkembangan user" class="h-full w-full max-w-xl overflow-y-auto bg-surface-white p-5 shadow-2xl sm:p-7"><div class="mb-5 flex justify-between gap-3"><h2 class="font-title-md text-title-md">Perkembangan Skor</h2><button aria-label="Tutup detail" @click="detailOpen = false"><X class="h-5 w-5" /></button></div><p v-if="store.isLoadingUser">Memuat detail...</p><p v-else-if="store.userError" role="alert">{{ store.userError }}</p><template v-else-if="store.selectedUser"><h3 class="font-title-md text-title-md">{{ store.selectedUser.user.nama }}</h3><p class="mb-5 text-on-surface-variant">{{ target(store.selectedUser.user) }}</p><div class="mb-5 grid grid-cols-2 gap-3"><div v-for="entry in [['Terbaik', store.selectedUser.summary.best_score], ['Terakhir', store.selectedUser.summary.latest_score], ['Rata-rata', store.selectedUser.summary.average_score], ['Jumlah Rekap', store.selectedUser.summary.total_recap]]" :key="entry[0]" class="rounded-2xl border border-soft-blue p-3"><p class="text-outline">{{ entry[0] }}</p><strong>{{ formatScore(entry[1]) }}</strong></div></div><h4 class="mb-2 font-label-sm text-label-sm">Tren Skor</h4><div class="mb-5 flex min-w-0 gap-1 overflow-x-auto pb-2"><div v-for="(point, index) in store.selectedUser.trend" :key="index" class="flex min-w-12 flex-col items-center justify-end gap-1"><span class="text-xs">{{ formatScore(point.total_score) }}</span><div class="w-5 rounded-t bg-primary-container" :style="{ height: `${Math.max(4, Math.min(100, Number(point.total_score) / 10))}px` }" /><span class="text-[10px] text-outline">{{ formatDate(point.recap_at) }}</span></div></div><h4 class="mb-2 font-label-sm text-label-sm">Rata-rata Subtes</h4><div class="mb-5 grid grid-cols-2 gap-2"><div v-for="(value, key) in store.selectedUser.subtest_average" :key="key" class="flex justify-between rounded-xl border border-soft-blue px-3 py-2"><span>{{ key.toUpperCase() }}</span><strong>{{ formatScore(value) }}</strong></div></div><h4 class="mb-2 font-label-sm text-label-sm">Riwayat Rekap</h4><div v-for="row in store.selectedUser.history" :key="row.recap_id" class="flex justify-between gap-3 border-t border-soft-blue py-3"><span>{{ row.platform || 'Platform tidak diketahui' }}<small class="block text-outline">{{ row.tryout_name || formatDate(row.recap_at) }}</small></span><strong>{{ formatScore(row.total_score) }}</strong></div></template></div></div>
    </template>
    <div v-else class="h-40 animate-pulse rounded-3xl bg-surface-container" aria-label="Memuat halaman" />
  </div>
</template>

