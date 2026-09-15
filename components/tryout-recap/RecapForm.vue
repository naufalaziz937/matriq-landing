<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ClipboardList, ArrowLeft, Trophy } from 'lucide-vue-next';
import { useUserTryoutRecapStore } from '~/stores/api/userTryoutRecap';
const props = defineProps({ recap: { type: Object, default: null } });
const store = useUserTryoutRecapStore();
const form = reactive({ platform: '', tryout_name: '', recap_at: new Date().toISOString().slice(0, 10), pu: '', ppu: '', pbm: '', pk: '', lbi: '', lbe: '', pm: '', total_score: '', notes: '' });
const options = ['Ruangguru', 'Pahamify', 'Brain Academy', 'Zenius', 'Quipper', 'Platform Sekolah'];
const platformOption = ref('');
const errors = ref({});
const personalBest = ref(false);
const editing = computed(() => Boolean(props.recap));
watch(() => props.recap, row => { if (row) { for (const key of Object.keys(form)) form[key] = row[key] ?? ''; form.recap_at = String(row.recap_at).slice(0, 10); platformOption.value = options.includes(row.platform) ? row.platform : 'Lainnya'; } }, { immediate: true });
const inputClass = 'mt-1 w-full min-w-0 rounded-xl border border-soft-blue bg-surface-container-low px-3 py-2.5 text-sm outline-none focus:border-primary-container';
async function save() {
  const next = {};
  if (!form.platform.trim()) next.platform = 'Platform wajib diisi.';
  if (!form.recap_at) next.recap_at = 'Tanggal wajib diisi.';
  for (const key of ['pu','ppu','pbm','pk','lbi','lbe','pm','total_score']) if (form[key] !== '' && form[key] != null && (!Number.isFinite(Number(form[key])) || Number(form[key]) < 0 || Number(form[key]) > 1000)) next[key] = 'Skor harus 0–1000.';
  if (form.total_score === '' || form.total_score == null) next.total_score = 'Total score wajib diisi.';
  errors.value = next;
  if (Object.keys(next).length) return;
  const body = { ...form, platform: form.platform.trim(), tryout_name: form.tryout_name.trim(), notes: form.notes.trim() };
  const result = editing.value ? await store.updateRecap(props.recap.recap_id, body) : await store.createRecap(body);
  if (!result) return;
  if (result.personal_best) { personalBest.value = true; setTimeout(() => navigateTo('/tryout-recap'), 1800); }
  else await navigateTo('/tryout-recap');
}
</script>
<template>
  <div class="mx-auto w-full max-w-3xl min-w-0 px-4 py-5 text-on-surface sm:px-6 sm:py-7"><NuxtLink to="/tryout-recap" class="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-container"><ArrowLeft class="h-4 w-4" /> Kembali ke Rekap</NuxtLink><header class="mb-5"><div class="flex items-center gap-2"><ClipboardList class="h-6 w-6 text-primary-container" /><h1 class="text-2xl font-bold">{{ editing ? 'Edit Rekap Tryout' : 'Tambah Rekap Tryout' }}</h1></div><p class="mt-1 text-sm text-on-surface-variant">Masukkan skor sesuai laporan dari platform eksternal. Total score dicatat terpisah dari skor subtes.</p></header>
    <form class="rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-6" @submit.prevent="save"><div class="grid gap-4 sm:grid-cols-2"><label class="text-sm font-semibold">Platform <span class="text-rose-600">*</span><select v-model="platformOption" :class="inputClass" @change="form.platform = platformOption === 'Lainnya' ? '' : platformOption"><option disabled value="">Pilih platform</option><option v-for="option in options" :key="option">{{ option }}</option><option>Lainnya</option></select><span v-if="errors.platform" class="text-xs text-rose-600">{{ errors.platform }}</span></label><label v-if="platformOption === 'Lainnya'" class="text-sm font-semibold">Nama Platform <span class="text-rose-600">*</span><input v-model="form.platform" :class="inputClass" maxlength="100" placeholder="Nama platform" /></label><label class="text-sm font-semibold">Nama Tryout<input v-model="form.tryout_name" :class="inputClass" maxlength="150" placeholder="Contoh: Tryout Nasional #7" /></label><label class="text-sm font-semibold">Tanggal Tryout <span class="text-rose-600">*</span><input v-model="form.recap_at" type="date" :class="inputClass" /><span v-if="errors.recap_at" class="text-xs text-rose-600">{{ errors.recap_at }}</span></label></div><h2 class="mt-6 font-bold">Skor Subtes</h2><p class="mb-3 text-xs text-outline">Kosongkan jika laporan platform tidak menyediakan skor subtes tersebut.</p><div class="grid grid-cols-2 gap-4 sm:grid-cols-4"><label v-for="code in ['pu','ppu','pbm','pk','lbi','lbe','pm']" :key="code" class="text-sm font-semibold">{{ code.toUpperCase() }}<input v-model="form[code]" type="number" min="0" max="1000" step="0.01" :class="inputClass" placeholder="0–1000" /><span v-if="errors[code]" class="text-xs text-rose-600">{{ errors[code] }}</span></label></div><label class="mt-5 block text-sm font-semibold">Total Score <span class="text-rose-600">*</span><input v-model="form.total_score" type="number" min="0" max="1000" step="0.01" :class="inputClass" placeholder="Sesuai laporan platform" /><span v-if="errors.total_score" class="text-xs text-rose-600">{{ errors.total_score }}</span></label><label class="mt-5 block text-sm font-semibold">Catatan<textarea v-model="form.notes" rows="4" maxlength="5000" :class="inputClass" placeholder="Hal yang ingin kamu evaluasi..." /></label><div v-if="store.error" role="alert" class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{{ store.error }}</div><div class="mt-6 flex justify-end gap-3"><NuxtLink to="/tryout-recap" class="rounded-xl border border-soft-blue px-4 py-2 text-sm font-semibold">Batal</NuxtLink><button :disabled="store.isSaving" class="rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{{ store.isSaving ? 'Menyimpan...' : 'Simpan Rekap' }}</button></div></form>
    <div v-if="personalBest" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div class="rounded-3xl bg-white p-8 text-center shadow-xl"><Trophy class="mx-auto h-10 w-10 text-primary-container" /><h2 class="mt-3 text-xl font-bold">Personal Best! 🎉</h2><p class="mt-1 text-sm text-on-surface-variant">Skor terbaikmu berhasil dicatat.</p></div></div>
  </div>
</template>
