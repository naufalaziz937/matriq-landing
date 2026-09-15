<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { FileDown, FileSpreadsheet, RefreshCw, Search, ShieldCheck, Users, ClipboardList, BookOpenCheck, ListChecks, GraduationCap, ChartNoAxesCombined, Target, Flag } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/api/auth';
import { useAdminSettingsStore } from '~/stores/api/adminSettings';
import { canAccessPage } from '~/utils/roles';

definePageMeta({ layout: 'default' });
const route = useRoute();
const auth = useAuthStore();
const settingsStore=useAdminSettingsStore();
const ready = ref(false), loading = ref(false), downloading = ref(false), error = ref('');
const types = ref([]), recent = ref([]), selected = ref('');
const campuses = ref([]), programs = ref([]);
const preview = ref({ rows:[],columns:[],total:0,available:true });
const filters = reactive({ role:'',status:'',province:'',campus_id:'',prodi_code:'',platform:'',min_score:'',max_score:'',subtest:'',category:'',difficulty:'',date_from:'',date_to:'',include_answers:false });
const icons = { users:Users,'tryout-recap':ClipboardList,'study-progress':BookOpenCheck,questions:ListChecks,tutors:GraduationCap,analytics:ChartNoAxesCombined,targets:Target,moderation:Flag };
const card='min-w-0 rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-5';
const input='min-w-0 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary-container';
const active = computed(() => types.value.find(item => item.id===selected.value));
const preferredFormat=computed(()=>settingsStore.settings?.system?.default_export_format || 'xlsx');
const activeFilters = computed(() => Object.fromEntries((active.value?.filters || []).map(key => [key, filters[key]]).filter(([,value]) => value !== '' && value != null && value !== false)));
const options = { role:[['','Semua role'],['1','Admin'],['2','Siswa'],['3','Tutor']],status:[['','Semua status'],['true','Aktif'],['false','Nonaktif']],subtest:[['','Semua subtes'],...['PU','PPU','PBM','PK','LBI','LBE','PM'].map(x=>[x,x])],difficulty:[['','Semua kesulitan'],['easy','Mudah'],['medium','Sedang'],['hard','Sulit']],statusQuestion:[['','Semua status'],...['draft','review','active','rejected'].map(x=>[x,x])] };
const filterLabels={ role:'Role',status:'Status',province:'Provinsi',campus_id:'ID kampus',prodi_code:'Kode prodi',platform:'Platform',min_score:'Skor minimum',max_score:'Skor maksimum',subtest:'Subtes',category:'Kategori',difficulty:'Kesulitan',date_from:'Dari tanggal',date_to:'Sampai tanggal',include_answers:'Sertakan jawaban dan pembahasan' };
function request(path, options={}) { return $fetch(path,{baseURL:useRuntimeConfig().public.apiBase,headers:{Authorization:`Bearer ${auth.token}`},...options}); }
async function loadCampuses() { try { const result=await request('/kampus',{query:{limit:500}}); campuses.value=result.data || []; } catch { campuses.value=[]; } }
async function loadPrograms(id) { programs.value=[]; if (!id) return; try { const result=await request(`/admin/campuses/${id}/prodi`,{query:{limit:500}}); programs.value=result.data || []; } catch { programs.value=[]; } }
function select(id) { selected.value=id; error.value=''; for (const key of Object.keys(filters)) filters[key]=key==='include_answers'?false:''; preview.value={rows:[],columns:[],total:0,available:true}; navigateTo({path:'/reports',query:{type:id}}, {replace:true}); loadPreview(); }
async function loadPreview() { if (!selected.value) return; loading.value=true; error.value=''; try { preview.value=(await request(`/admin/reports/${selected.value}/preview`,{query:activeFilters.value})).data; } catch(e) { error.value=e?.data?.message || 'Gagal memuat preview laporan.'; } finally { loading.value=false; } }
async function loadRecent() { try { recent.value=(await request('/admin/reports/recent')).data || []; } catch { recent.value=[]; } }
async function download(format) {
  downloading.value=true; error.value='';
  try {
    const query=new URLSearchParams(activeFilters.value).toString();
    const response=await fetch(`${useRuntimeConfig().public.apiBase}/admin/reports/${selected.value}/export/${format}?${query}`,{headers:{Authorization:`Bearer ${auth.token}`}});
    if (!response.ok) { const payload=await response.json().catch(()=>null); throw new Error(payload?.message || 'Gagal mengekspor laporan.'); }
    const url=URL.createObjectURL(await response.blob()), link=document.createElement('a');
    link.href=url; link.download=`matriq-${selected.value}-${new Date().toISOString().slice(0,10)}.${format}`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    await loadRecent();
  } catch(e) { error.value=e.message || 'Gagal mengekspor laporan.'; } finally { downloading.value=false; }
}
function display(value) { if (value == null) return '—'; if (typeof value==='boolean') return value?'Ya':'Tidak'; if (typeof value==='object') return JSON.stringify(value); return String(value); }
watch(() => route.query.type, id => { if (id && types.value.some(item=>item.id===id) && id!==selected.value) { selected.value=id; loadPreview(); } });
watch(() => filters.campus_id, id => { filters.prodi_code=''; loadPrograms(id); });
onMounted(async () => {
  auth.initializeAuth(); if (!auth.token) return navigateTo('/login');
  const user=await auth.fetchCurrentUser(); if (Number(user?.role)!==1 || !canAccessPage(user?.role,'reports.read')) return navigateTo('/dashboard');
  ready.value=true;
  try { types.value=(await request('/admin/reports/types')).data || []; selected.value=types.value.some(t=>t.id===route.query.type)?route.query.type:(types.value[0]?.id || ''); await Promise.all([loadPreview(),loadRecent(),loadCampuses(),settingsStore.fetchSettings()]); }
  catch(e) { error.value=e?.data?.message || 'Gagal memuat daftar laporan.'; }
});
</script>

<template>
  <div class="mx-auto w-full max-w-[1700px] min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
    <template v-if="ready && Number(auth.user?.role)===1">
      <header class="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h1 class="font-headline-md text-headline-md text-on-surface">Reports / Export Center</h1><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">Pratinjau data, atur filter, lalu unduh laporan MatrIQ.</p></div><span class="inline-flex items-center gap-2 rounded-full bg-pale-blue px-3 py-2 text-xs text-primary-container"><ShieldCheck class="h-4 w-4"/>Akses Admin</span></header>
      <p v-if="error" role="alert" class="mb-4 rounded-2xl border border-danger-rose bg-surface-white p-3 text-danger-rose">{{ error }}</p>
      <section aria-label="Jenis laporan" class="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button v-for="type in types" :key="type.id" type="button" :aria-pressed="selected===type.id" :class="[card,'text-left transition hover:border-primary-container',selected===type.id?'border-primary-container ring-1 ring-primary-container':'']" @click="select(type.id)">
          <div class="mb-3 flex items-center justify-between"><span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-pale-blue text-primary-container"><component :is="icons[type.id] || FileDown" class="h-5 w-5"/></span><span class="text-xs text-on-surface-variant">{{ Number(type.total).toLocaleString('id-ID') }} data</span></div>
          <h2 class="font-title-md text-title-md text-on-surface">{{ type.label }}</h2><p class="mt-1 text-xs text-on-surface-variant">{{ type.description }}</p>
        </button>
      </section>
      <section v-if="active" :class="[card,'mb-6']" aria-label="Konfigurasi laporan"><div class="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 class="font-title-md text-title-md text-on-surface">Filter {{ active.label }}</h2><p class="text-xs text-on-surface-variant">Filter yang sama dipakai untuk preview dan berkas ekspor.</p></div><button type="button" class="inline-flex items-center gap-2 rounded-2xl border border-primary-container px-4 py-2 text-sm text-primary-container hover:bg-pale-blue" :disabled="loading" @click="loadPreview"><Search class="h-4 w-4"/>Terapkan Filter</button></div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><label v-for="key in active.filters.filter(x=>x!=='include_answers')" :key="key" class="block min-w-0"><span class="mb-1 block text-xs text-on-surface-variant">{{ filterLabels[key] }}</span><select v-if="key==='role'||key==='status'||key==='subtest'||key==='difficulty'" v-model="filters[key]" :class="input"><option v-for="option in (key==='status'&&['questions','moderation'].includes(selected)?options.statusQuestion:options[key])" :key="option[0]" :value="option[0]">{{ option[1] }}</option></select><select v-else-if="key==='campus_id'" v-model="filters.campus_id" :class="input"><option value="">Semua kampus</option><option v-for="campus in campuses" :key="campus.id" :value="campus.id">{{ campus.nama }}</option></select><select v-else-if="key==='prodi_code'" v-model="filters.prodi_code" :class="input" :disabled="!filters.campus_id"><option value="">Semua prodi</option><option v-for="program in programs" :key="program.kode_snbt" :value="program.kode_snbt">{{ program.nama }}</option></select><input v-else v-model="filters[key]" :type="key.startsWith('date_')?'date':['min_score','max_score'].includes(key)?'number':'text'" :class="input" :placeholder="filterLabels[key]"/></label></div>
        <label v-if="active.filters.includes('include_answers')" class="mt-4 inline-flex items-center gap-2 text-sm text-on-surface"><input v-model="filters.include_answers" type="checkbox"/>{{ filterLabels.include_answers }}</label>
      </section>
      <section v-if="active" :class="[card,'mb-6']" aria-label="Pratinjau laporan"><div class="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 class="font-title-md text-title-md text-on-surface">Preview {{ active.label }}</h2><p class="text-xs text-on-surface-variant">{{ loading?'Memuat...':`${Number(preview.total).toLocaleString('id-ID')} baris ditemukan · menampilkan maksimal 20` }}</p></div><div class="flex flex-wrap gap-2"><button type="button" :disabled="loading||downloading||!preview.available" class="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm disabled:opacity-50" :class="preferredFormat==='csv'?'bg-primary-container text-white':'border border-primary-container text-primary-container'" @click="download('csv')"><FileDown class="h-4 w-4"/>CSV</button><button type="button" :disabled="loading||downloading||!preview.available" class="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm disabled:opacity-50" :class="preferredFormat==='xlsx'?'bg-primary-container text-white':'border border-primary-container text-primary-container'" @click="download('xlsx')"><FileSpreadsheet class="h-4 w-4"/>Excel</button></div></div>
        <p v-if="preview.notice" class="rounded-2xl bg-pale-blue p-4 text-sm text-primary-container">{{ preview.notice }}</p><div v-else-if="!loading && !preview.rows.length" class="rounded-2xl bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">Tidak ada data untuk filter ini.</div><div v-else class="max-w-full overflow-x-auto"><table class="min-w-full whitespace-nowrap text-left text-xs"><thead class="bg-pale-blue text-primary-container"><tr><th v-for="column in preview.columns" :key="column" class="px-3 py-2 font-semibold">{{ column.replaceAll('_',' ') }}</th></tr></thead><tbody><tr v-for="(row,index) in preview.rows" :key="index" class="border-t border-soft-blue"><td v-for="column in preview.columns" :key="column" class="max-w-[240px] truncate px-3 py-2 text-on-surface" :title="display(row[column])">{{ display(row[column]) }}</td></tr></tbody></table></div>
      </section>
      <section :class="card" aria-label="Riwayat ekspor"><div class="mb-3 flex items-center justify-between"><h2 class="font-title-md text-title-md text-on-surface">Ekspor Terakhir</h2><button type="button" class="text-primary-container" aria-label="Muat ulang riwayat" @click="loadRecent"><RefreshCw class="h-4 w-4"/></button></div><p v-if="!recent.length" class="text-sm text-on-surface-variant">Belum ada ekspor.</p><div v-else class="space-y-2"><div v-for="(item,index) in recent" :key="index" class="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface-container-low px-4 py-3 text-sm"><span>{{ types.find(t=>t.id===item.report_type)?.label || item.report_type }} · {{ item.format.toUpperCase() }} · {{ item.total_rows }} baris</span><span class="text-xs text-on-surface-variant">{{ new Date(item.created_at).toLocaleString('id-ID') }}</span></div></div></section>
    </template>
  </div>
</template>
