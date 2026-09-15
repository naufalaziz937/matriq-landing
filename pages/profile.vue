<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { UserRound, Camera, School, GraduationCap, Target, BookOpenCheck, Brain, Trophy, Clock3, ShieldCheck, KeyRound, Pencil, Save, X } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/api/auth';
import { useProfileStore } from '~/stores/api/profile';
import { getRoleLabel } from '~/utils/roles';

definePageMeta({ layout: 'default' });
const auth = useAuthStore();
const store = useProfileStore();
const { user, studentProfile, target, tutorProfile, summary, performance, recentContent } = storeToRefs(store);
const role = computed(() => Number(store.profileData?.role));
const roleLabel = computed(() => getRoleLabel(role.value));
const initials = computed(() => (user.value?.nama || '?').split(/\s+/).map(part => part[0]).join('').slice(0,2).toUpperCase());
const editing = ref('');
const success = ref('');
const formError = ref('');
const photoInput = ref<HTMLInputElement | null>(null);
const common = reactive({ nama: '', no_hp: '', gender: '' });
const academic = reactive({ sekolah: '', kelas: '', tahun_lulus: '', provinsi: '', kota_kab: '' });
const tutor = reactive({ bio: '', specialization: '', institution: '', experience_years: '', expertise_subtests: [] as string[] });
const password = reactive({ password_lama: '', password_baru: '', konfirmasi_password: '' });
const targetScore = ref<string | number>('');
const choices = ref<{ campus_id: string; prodi_code: string }[]>([]);
const programsByCampus = ref<Record<string, any[]>>({});
const subtests = ['PU','PPU','PBM','PK','LBI','LBE','PM'];
const filled = (value: any) => value === null || value === undefined || value === '' ? 'Belum diisi' : value;
const date = (value: string) => value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diisi';

function hydrate() {
  Object.assign(common, { nama: user.value?.nama || '', no_hp: user.value?.no_hp || '', gender: user.value?.gender || '' });
  Object.assign(academic, { sekolah: studentProfile.value?.sekolah || '', kelas: studentProfile.value?.kelas || '', tahun_lulus: studentProfile.value?.tahun_lulus ?? '', provinsi: studentProfile.value?.provinsi_kode || '', kota_kab: studentProfile.value?.kota_kab_kode || '' });
  Object.assign(tutor, { bio: tutorProfile.value?.bio || '', specialization: tutorProfile.value?.specialization || '', institution: tutorProfile.value?.institution || '', experience_years: tutorProfile.value?.experience_years ?? '', expertise_subtests: [...(tutorProfile.value?.expertise_subtests || [])] });
  targetScore.value = target.value?.target_score ?? '';
  choices.value = (target.value?.pilihan || []).filter(item => item.prodi_code).map(item => ({ campus_id: String(item.campus_id), prodi_code: item.prodi_code }));
}
async function load() {
  auth.initializeAuth();
  if (!auth.token) { await navigateTo('/login'); return; }
  if (await store.fetchProfile()) hydrate();
}
onMounted(load);
function begin(section: string) {
  hydrate(); formError.value = ''; success.value = ''; editing.value = section;
  if (section === 'academic') { store.fetchProvinces().catch(() => { formError.value = 'Gagal memuat provinsi.'; }); if (academic.provinsi) store.fetchCities(academic.provinsi).catch(() => { formError.value = 'Gagal memuat kota.'; }); }
  if (section === 'target') { store.fetchCampuses().catch(() => { formError.value = 'Gagal memuat kampus.'; }); choices.value.forEach(choice => loadPrograms(choice.campus_id)); }
}
async function provinceChanged() { academic.kota_kab = ''; try { await store.fetchCities(academic.provinsi); } catch { formError.value = 'Gagal memuat kota.'; } }
async function loadPrograms(campusId: string) { if (!campusId || programsByCampus.value[campusId]) return; try { programsByCampus.value[campusId] = await store.fetchPrograms(campusId); } catch { formError.value = 'Gagal memuat prodi.'; } }
function campusChanged(choice: any) { choice.prodi_code = ''; loadPrograms(choice.campus_id); }
async function save() {
  formError.value = ''; success.value = '';
  try {
    if (editing.value === 'common') await store.updateCommonProfile({ nama: common.nama, no_hp: common.no_hp, gender: common.gender });
    if (editing.value === 'academic') await store.updateStudentProfile({ ...academic });
    if (editing.value === 'target') await store.updateTarget({ pilihan: choices.value.map(choice => choice.prodi_code), target_score: targetScore.value });
    if (editing.value === 'tutor') await store.updateTutorProfile({ ...tutor });
    if (editing.value === 'password') { await store.changePassword({ ...password }); Object.assign(password, { password_lama: '', password_baru: '', konfirmasi_password: '' }); }
    editing.value = ''; hydrate(); success.value = 'Profil berhasil diperbarui.';
  } catch { formError.value = store.error || 'Gagal menyimpan perubahan.'; }
}
async function photoSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  formError.value = ''; success.value = '';
  try { await store.uploadPhoto(file); success.value = 'Foto profil berhasil diperbarui.'; }
  catch { formError.value = store.error || 'Gagal mengunggah foto.'; }
  if (photoInput.value) photoInput.value.value = '';
}
const studentStats = computed(() => [
  { label: 'Materi Selesai', value: summary.value?.completed_materials ?? 0, icon: BookOpenCheck },
  { label: 'Soal Dikerjakan', value: summary.value?.questions_attempted ?? 0, icon: Brain },
  { label: 'Practice Accuracy', value: summary.value?.practice_accuracy == null ? '—' : `${summary.value.practice_accuracy}%`, icon: Target },
  { label: 'Best Tryout Score', value: summary.value?.best_tryout_score ?? '—', icon: Trophy },
  { label: 'Study Streak', value: `${summary.value?.study_streak ?? 0} Hari`, icon: Clock3 },
  { label: 'Roadmap Stage', value: summary.value?.roadmap_stage ? `Tahap ${summary.value.roadmap_stage}` : '—', icon: GraduationCap },
]);
const tutorStats = computed(() => [
  { label: 'Total Soal', value: summary.value?.total_questions ?? 0 }, { label: 'Soal Aktif', value: summary.value?.active_questions ?? 0 },
  { label: 'Menunggu Review', value: summary.value?.review_questions ?? 0 }, { label: 'Ditolak', value: summary.value?.rejected_questions ?? 0 },
  { label: 'Total Materi', value: summary.value?.total_materials ?? 0 }, { label: 'Materi Aktif', value: summary.value?.active_materials ?? 0 },
  { label: 'Materi Draft', value: summary.value?.pending_materials ?? 0 },
]);
const adminStats = computed(() => [
  { label: 'Soal Dibuat', value: summary.value?.questions_created ?? 0 },
  { label: 'Konten Direview', value: summary.value?.content_reviewed ?? 0 },
  { label: 'Laporan Diekspor', value: summary.value?.reports_exported ?? 0 },
]);
</script>

<template>
  <div class="mx-auto w-full max-w-[1500px] min-w-0 space-y-5 px-4 py-5 sm:px-6 lg:px-8">
    <div><p class="text-xs font-bold text-blue-600">Akun · Pengaturan Profil</p><h1 class="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Profil & Pengaturan Akun</h1><p class="mt-1 text-sm text-slate-500">Kelola informasi dan keamanan akun MatrIQ.</p></div>
    <div v-if="store.isLoading && !store.profileData" class="space-y-4" aria-label="Memuat profil"><div class="h-48 animate-pulse rounded-3xl bg-slate-200" /><div class="grid gap-4 lg:grid-cols-2"><div v-for="n in 2" :key="n" class="h-64 animate-pulse rounded-2xl bg-slate-200" /></div></div>
    <div v-else-if="store.error && !store.profileData" role="alert" class="rounded-2xl border border-red-200 bg-white p-5 text-red-700">{{ store.error }} <button class="ml-2 font-bold underline" @click="load">Coba Lagi</button></div>
    <div v-else-if="!user || ![1,2,3].includes(role)" role="alert" class="rounded-2xl border border-red-200 bg-white p-5 text-red-700">Profil tidak tersedia untuk role ini.</div>
    <template v-else>
      <p v-if="success" role="status" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ success }}</p>
      <p v-if="formError" role="alert" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ formError }}</p>
      <section class="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div class="h-24 bg-gradient-to-r from-blue-100 via-slate-50 to-amber-100 sm:h-28" />
        <div class="flex flex-wrap items-end gap-4 px-5 pb-5 sm:px-6">
          <div class="relative -mt-11 h-24 w-24 shrink-0 rounded-2xl border-4 border-white bg-blue-600 shadow-md"><img v-if="user.foto_profile" :src="user.foto_profile" :alt="`Foto profil ${user.nama}`" class="h-full w-full rounded-xl object-cover" /><div v-else class="flex h-full w-full items-center justify-center text-3xl font-extrabold text-white">{{ initials }}</div><button type="button" class="absolute -bottom-2 -right-2 rounded-xl border border-blue-100 bg-white p-2 text-blue-600 shadow-sm" aria-label="Ganti foto profil" @click="photoInput?.click()"><Camera class="h-4 w-4" /></button><input ref="photoInput" class="hidden" type="file" accept="image/jpeg,image/png,image/webp" @change="photoSelected" /></div>
          <div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h2 class="break-words text-xl font-bold text-slate-900">{{ user.nama }}</h2><span class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{{ roleLabel }}</span></div><p class="mt-1 break-all text-sm text-slate-500">{{ user.email }}</p><p class="mt-1 text-xs text-slate-400">Bergabung sejak {{ date(user.created_at) }}</p></div>
          <button class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700" @click="begin('common')"><Pencil class="h-4 w-4" /> Edit Profil</button>
        </div>
      </section>
      <div class="grid gap-4 lg:grid-cols-2">
        <section class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center gap-2 border-b border-blue-100 pb-3"><UserRound class="h-5 w-5 text-blue-600" /><h3 class="font-bold text-slate-900">Informasi Akun</h3></div><dl class="grid gap-3 text-sm"><div><dt class="text-xs text-slate-500">Nama</dt><dd class="font-semibold text-slate-800">{{ user.nama }}</dd></div><div><dt class="text-xs text-slate-500">Email</dt><dd class="break-all font-semibold text-slate-800">{{ user.email }}</dd></div><div><dt class="text-xs text-slate-500">No. HP</dt><dd class="font-semibold text-slate-800">{{ filled(user.no_hp) }}</dd></div><div><dt class="text-xs text-slate-500">Gender</dt><dd class="font-semibold text-slate-800">{{ user.gender === 'L' ? 'Laki-laki' : user.gender === 'P' ? 'Perempuan' : 'Belum diisi' }}</dd></div></dl></section>
        <section v-if="role === 2" class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center justify-between border-b border-blue-100 pb-3"><div class="flex items-center gap-2"><School class="h-5 w-5 text-blue-600" /><h3 class="font-bold text-slate-900">Profil Akademik</h3></div><button class="text-xs font-bold text-blue-600" @click="begin('academic')">Ubah</button></div><dl class="grid gap-3 text-sm"><div v-for="item in [['Sekolah',studentProfile?.sekolah],['Kelas',studentProfile?.kelas],['Tahun Lulus',studentProfile?.tahun_lulus],['Provinsi',studentProfile?.provinsi_nama],['Kota/Kabupaten',studentProfile?.kota_kab_nama]]" :key="item[0]"><dt class="text-xs text-slate-500">{{ item[0] }}</dt><dd class="font-semibold text-slate-800">{{ filled(item[1]) }}</dd></div></dl></section>
        <section v-if="role === 3" class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center justify-between border-b border-blue-100 pb-3"><div class="flex items-center gap-2"><GraduationCap class="h-5 w-5 text-blue-600" /><h3 class="font-bold text-slate-900">Profil Tutor</h3></div><button class="text-xs font-bold text-blue-600" @click="begin('tutor')">Ubah</button></div><dl class="grid gap-3 text-sm"><div v-for="item in [['Bio',tutorProfile?.bio],['Spesialisasi',tutorProfile?.specialization],['Institusi',tutorProfile?.institution],['Pengalaman Mengajar',tutorProfile?.experience_years == null ? null : `${tutorProfile.experience_years} tahun`],['Subtes Keahlian',tutorProfile?.expertise_subtests?.join(', ')]]" :key="item[0]"><dt class="text-xs text-slate-500">{{ item[0] }}</dt><dd class="font-semibold text-slate-800">{{ filled(item[1]) }}</dd></div></dl></section>
        <section v-if="role === 1" class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center gap-2 border-b border-blue-100 pb-3"><ShieldCheck class="h-5 w-5 text-blue-600" /><h3 class="font-bold text-slate-900">Informasi Admin</h3></div><dl class="grid gap-3 text-sm"><div v-for="item in [['Role',roleLabel],['Account ID',user.user_id],['Dibuat',date(user.created_at)],['Terakhir Diperbarui',date(user.updated_at)]]" :key="item[0]"><dt class="text-xs text-slate-500">{{ item[0] }}</dt><dd class="font-semibold text-slate-800">{{ item[1] }}</dd></div></dl></section>
      </div>
      <section v-if="role === 2" class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center justify-between border-b border-blue-100 pb-3"><div class="flex items-center gap-2"><Target class="h-5 w-5 text-blue-600" /><h3 class="font-bold text-slate-900">Target PTN</h3></div><button class="text-xs font-bold text-blue-600" @click="begin('target')">Ubah</button></div><p class="text-sm text-slate-600">Target skor: <strong class="text-blue-700">{{ target?.target_score ?? 'Belum diisi' }}</strong></p><div v-if="target?.pilihan?.length" class="mt-4 grid gap-3 sm:grid-cols-2"><div v-for="item in target.pilihan" :key="item.priority" class="rounded-xl border border-blue-100 bg-blue-50/50 p-3"><p class="text-xs font-bold text-blue-600">Pilihan {{ item.priority }}</p><p class="mt-1 text-sm font-bold text-slate-800">{{ item.campus || 'Kampus tidak tersedia' }}</p><p class="text-xs text-slate-500">{{ item.program || 'Prodi tidak tersedia' }}</p></div></div><p v-else class="mt-3 text-sm text-slate-500">Belum ada target PTN.</p></section>
      <section v-if="role === 2 || role === 3 || role === 1" class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center gap-2 border-b border-blue-100 pb-3"><BookOpenCheck class="h-5 w-5 text-blue-600" /><h3 class="font-bold text-slate-900">{{ role === 2 ? 'Progress Belajar' : role === 3 ? 'Ringkasan Kontribusi' : 'Aktivitas Admin' }}</h3></div><div class="grid grid-cols-2 gap-3 sm:grid-cols-3"><div v-for="item in role === 2 ? studentStats : role === 3 ? tutorStats : adminStats" :key="item.label" class="rounded-xl border border-blue-100 bg-slate-50 p-3"><p class="text-xs text-slate-500">{{ item.label }}</p><p class="mt-1 text-lg font-bold text-slate-900">{{ item.value }}</p></div></div></section>
      <section v-if="role === 3" class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center gap-2 border-b border-blue-100 pb-3"><Brain class="h-5 w-5 text-blue-600" /><h3 class="font-bold text-slate-900">Performa Konten</h3></div><div class="grid gap-3 text-sm sm:grid-cols-2"><p>Total pengerjaan soal: <strong>{{ performance?.question_attempts ?? 0 }}</strong></p><p>Akurasi rata-rata: <strong>{{ performance?.average_accuracy == null ? '—' : `${performance.average_accuracy}%` }}</strong></p><p>Materi paling banyak dibaca: <strong>{{ performance?.most_read_material?.title || 'Belum ada' }}</strong></p><p>Subtes paling banyak dibuat: <strong>{{ performance?.top_subtest?.code || 'Belum ada' }}</strong></p></div><div v-if="recentContent.length" class="mt-4 border-t border-blue-100 pt-3"><h4 class="mb-2 text-sm font-bold">Konten Terbaru</h4><div v-for="item in recentContent" :key="`${item.type}-${item.id}`" class="flex items-center justify-between gap-3 py-1.5 text-xs"><span class="truncate">{{ item.type === 'question' ? 'Soal' : 'Materi' }} · {{ item.title }}</span><span class="shrink-0 text-slate-500">{{ item.status }}</span></div></div></section>
      <section class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center gap-2 border-b border-blue-100 pb-3"><ShieldCheck class="h-5 w-5 text-blue-600" /><h3 class="font-bold text-slate-900">Keamanan Akun</h3></div><p class="text-sm text-slate-500">Ubah kata sandi dengan memasukkan kata sandi saat ini.</p><button class="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50" @click="begin('password')"><KeyRound class="h-4 w-4" /> Ubah Kata Sandi</button></section>
    </template>
    <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-5" @click.self="editing = ''"><div role="dialog" aria-modal="true" :aria-label="`Ubah ${editing}`" class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-blue-100 bg-white p-5 shadow-2xl sm:p-6"><div class="mb-4 flex items-center justify-between"><h2 class="text-lg font-bold text-slate-900">{{ editing === 'common' ? 'Edit Informasi Akun' : editing === 'academic' ? 'Edit Profil Akademik' : editing === 'target' ? 'Edit Target PTN' : editing === 'tutor' ? 'Edit Profil Tutor' : 'Ubah Kata Sandi' }}</h2><button aria-label="Tutup" @click="editing = ''"><X class="h-5 w-5 text-slate-500" /></button></div><form class="space-y-3" @submit.prevent="save">
      <template v-if="editing === 'common'"><label class="block text-xs font-semibold">Nama<input v-model="common.nama" required minlength="2" maxlength="150" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Email (tidak dapat diubah)<input :value="user?.email" disabled class="mt-1 w-full rounded-xl border border-blue-100 bg-slate-50 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">No. HP<input v-model="common.no_hp" maxlength="30" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Gender<select v-model="common.gender" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm"><option value="">Belum diisi</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label></template>
      <template v-if="editing === 'academic'"><label class="block text-xs font-semibold">Sekolah<input v-model="academic.sekolah" maxlength="150" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Kelas<input v-model="academic.kelas" maxlength="50" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Tahun Lulus<input v-model="academic.tahun_lulus" type="number" min="2000" :max="new Date().getFullYear() + 10" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Provinsi<select v-model="academic.provinsi" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" @change="provinceChanged"><option value="">Pilih provinsi</option><option v-for="item in store.provinces" :key="item.kode" :value="item.kode">{{ item.nama }}</option></select></label><label class="block text-xs font-semibold">Kota/Kabupaten<select v-model="academic.kota_kab" :disabled="!academic.provinsi" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm"><option value="">Pilih kota/kabupaten</option><option v-for="item in store.cities" :key="item.kode" :value="item.kode">{{ item.label }}</option></select></label></template>
      <template v-if="editing === 'target'"><label class="block text-xs font-semibold">Target Skor<input v-model="targetScore" type="number" min="0" max="1000" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><div v-for="(choice,index) in choices" :key="index" class="rounded-xl border border-blue-100 bg-slate-50 p-3"><div class="mb-2 flex items-center justify-between"><strong class="text-xs text-blue-700">Pilihan {{ index + 1 }}</strong><div class="flex gap-2"><button v-if="index > 0" type="button" class="text-xs text-blue-600" @click="[choices[index - 1],choices[index]] = [choices[index],choices[index - 1]]">Naik</button><button type="button" class="text-xs text-red-600" @click="choices.splice(index,1)">Hapus</button></div></div><label class="block text-xs font-semibold">Kampus<select v-model="choice.campus_id" class="mt-1 w-full rounded-xl border border-blue-100 bg-white p-2.5 text-sm" @change="campusChanged(choice)"><option value="">Pilih kampus</option><option v-for="item in store.campuses" :key="item.id" :value="String(item.id)">{{ item.nama }}</option></select></label><label class="mt-2 block text-xs font-semibold">Prodi<select v-model="choice.prodi_code" :disabled="!choice.campus_id" class="mt-1 w-full rounded-xl border border-blue-100 bg-white p-2.5 text-sm"><option value="">Pilih prodi</option><option v-for="item in programsByCampus[choice.campus_id] || []" :key="item.kode_snbt" :value="item.kode_snbt">{{ item.nama }}</option></select></label></div><button v-if="choices.length < 4" type="button" class="text-sm font-bold text-blue-600" @click="choices.push({campus_id:'',prodi_code:''})">+ Tambah Pilihan</button></template>
      <template v-if="editing === 'tutor'"><label class="block text-xs font-semibold">Bio<textarea v-model="tutor.bio" rows="3" maxlength="3000" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Spesialisasi<input v-model="tutor.specialization" maxlength="200" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Institusi / Asal<input v-model="tutor.institution" maxlength="200" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Pengalaman Mengajar (tahun)<input v-model="tutor.experience_years" type="number" min="0" max="80" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><div><p class="text-xs font-semibold">Subtes Keahlian</p><div class="mt-2 flex flex-wrap gap-2"><label v-for="code in subtests" :key="code" class="flex items-center gap-1 rounded-lg border border-blue-100 px-2 py-1 text-xs"><input v-model="tutor.expertise_subtests" type="checkbox" :value="code" />{{ code }}</label></div></div></template>
      <template v-if="editing === 'password'"><label class="block text-xs font-semibold">Kata Sandi Lama<input v-model="password.password_lama" type="password" required class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Kata Sandi Baru<input v-model="password.password_baru" type="password" required minlength="8" class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label><label class="block text-xs font-semibold">Konfirmasi Kata Sandi Baru<input v-model="password.konfirmasi_password" type="password" required class="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" /></label></template>
      <p v-if="formError" role="alert" class="text-sm text-red-600">{{ formError }}</p><div class="flex justify-end gap-2 pt-3"><button type="button" class="rounded-xl border border-blue-100 px-4 py-2 text-sm font-semibold" @click="editing = ''">Batal</button><button type="submit" :disabled="store.isSaving" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><Save class="h-4 w-4" />{{ store.isSaving ? 'Menyimpan...' : 'Simpan' }}</button></div>
    </form></div></div>
  </div>
</template>
