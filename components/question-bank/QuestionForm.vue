<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useQuestionDependenciesStore } from '~/stores/api/questionDependencies';
import { LoaderCircle, Save } from 'lucide-vue-next';

const props = defineProps<{ initial?: Record<string, any> | null; categories?: Array<{ id: string; name: string }>; saving?: boolean; tutor?: boolean; defaultStatus?: 'draft' | 'active' }>();
const emit = defineEmits<{ (e: 'submit', payload: Record<string, any>): void }>();
const error = ref('');
const dependencies = useQuestionDependenciesStore();
const hydrating = ref(false);
const subtests = [
  { code: 'PU', label: 'Penalaran Umum' }, { code: 'PPU', label: 'Pengetahuan dan Pemahaman Umum' },
  { code: 'PBM', label: 'Pemahaman Bacaan dan Menulis' }, { code: 'PK', label: 'Pengetahuan Kuantitatif' },
  { code: 'LBI', label: 'Literasi Bahasa Indonesia' }, { code: 'LBE', label: 'Literasi Bahasa Inggris' },
  { code: 'PM', label: 'Penalaran Matematika' },
];
const keys = ['A', 'B', 'C', 'D', 'E'];
const form = reactive({
  subtest: '', category_id: '' as string | number, difficulty: 'medium', difficulty_level: 2, material_id: '' as string | number, question: '',
  options: keys.map((key) => ({ key, text: '' })),
  correct_answer: 'A', explanation: '', status: 'draft',
});

watch(() => props.initial, async (item) => {
  if (!item) return;
  hydrating.value = true;
  form.subtest = item.subtest ?? '';
  const initialCategoryId = item.category_id ?? item.category_master?.id ?? '';
  form.difficulty = item.difficulty ?? 'medium';
  form.difficulty_level = Number(item.difficulty_level ?? ({ easy: 1, medium: 2, hard: 3 } as Record<string, number>)[item.difficulty] ?? 2);
  const materialId = item.material_id ?? '';
  form.material_id = '';
  form.question = item.question ?? '';
  form.options = keys.map((key) => ({ key, text: item.options?.find((option: any) => option.key === key)?.text ?? '' }));
  form.correct_answer = item.correct_answer ?? 'A';
  form.explanation = item.explanation ?? '';
  form.status = ['active', 'draft', 'review'].includes(item.status) ? item.status : 'draft';
  await dependencies.fetchCategories(form.subtest);
  form.category_id = initialCategoryId || dependencies.categories.find((entry: any) => entry.subtest === form.subtest && entry.name === item.category)?.id || '';
  await dependencies.fetchMaterials(form.subtest, form.category_id);
  form.material_id = materialId;
  hydrating.value = false;
}, { immediate: true });
watch(() => props.defaultStatus, value => { if (!props.initial && ['draft','active'].includes(value || '')) form.status=value || 'draft'; }, { immediate:true });
watch(() => form.subtest, async (code, previous) => {
  if (hydrating.value) return;
  if (previous !== code) { form.category_id = ''; form.material_id = ''; }
  await dependencies.fetchCategories(code);
});
watch(() => form.category_id, async (categoryId, previous) => {
  if (hydrating.value) return;
  if (previous !== categoryId) form.material_id = '';
  await dependencies.fetchMaterials(form.subtest, categoryId);
});
watch(() => form.difficulty_level, (level) => { form.difficulty = level === 1 ? 'easy' : level === 2 ? 'medium' : 'hard'; });

function submit() {
  error.value = '';
  if (form.question.trim().length < 5) error.value = 'Pertanyaan minimal 5 karakter.';
  else if (!form.category_id) error.value = 'Kategori wajib dipilih.';
  else if (!form.material_id) error.value = 'Materi aktif wajib dipilih.';
  else if (form.options.some((option) => !option.text.trim())) error.value = 'Semua pilihan A–E wajib diisi.';
  else if (!form.explanation.trim()) error.value = 'Pembahasan wajib diisi.';
  if (error.value) return;
  emit('submit', {
    subtest: form.subtest, category: dependencies.categories.find((item: any) => Number(item.id) === Number(form.category_id))?.name || '', category_id: Number(form.category_id), difficulty: form.difficulty, difficulty_level: form.difficulty_level, material_id: Number(form.material_id),
    question: form.question.trim(), options: form.options.map((option) => ({ key: option.key, text: option.text.trim() })),
    correct_answer: form.correct_answer, explanation: form.explanation.trim(), status: form.status,
  });
}
</script>

<template>
  <form class="space-y-5 rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm sm:p-6" @submit.prevent="submit">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label class="font-label-sm text-label-sm text-on-surface">Subtes
        <select v-model="form.subtest" required class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"><option value="" disabled>Pilih subtes</option><option v-for="item in subtests" :key="item.code" :value="item.code">{{ item.label }}</option></select>
      </label>
      <label class="font-label-sm text-label-sm text-on-surface">Kategori
        <select v-model="form.category_id" required :disabled="!form.subtest || dependencies.isLoadingCategories" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm disabled:opacity-60"><option value="" disabled>{{ !form.subtest ? 'Pilih subtes terlebih dahulu' : dependencies.isLoadingCategories ? 'Memuat kategori...' : dependencies.categories.length ? 'Pilih kategori' : 'Belum ada kategori untuk subtes ini.' }}</option><option v-for="item in dependencies.categories" :key="item.id" :value="item.id">{{ item.name }}</option></select>
        <span v-if="dependencies.categoryError" class="mt-1 block text-xs text-danger-rose">{{ dependencies.categoryError }}</span>
      </label>
      <label class="font-label-sm text-label-sm text-on-surface">Materi
        <select v-model="form.material_id" required :disabled="!form.category_id || dependencies.isLoadingMaterials" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm disabled:opacity-60"><option value="" disabled>{{ dependencies.isLoadingMaterials ? 'Memuat materi...' : dependencies.materials.length ? 'Pilih materi aktif' : 'Belum ada materi aktif' }}</option><option v-for="item in dependencies.materials" :key="item.id" :value="item.id">{{ item.title }}</option></select>
        <span v-if="dependencies.materialError" class="mt-1 block text-xs text-danger-rose">{{ dependencies.materialError }}</span>
      </label>
      <label class="font-label-sm text-label-sm text-on-surface">Tingkat Kesulitan
        <select v-model.number="form.difficulty_level" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"><option :value="1">Fundamental</option><option :value="2">Intermediate</option><option :value="3">Advanced</option><option :value="4">Mastery</option></select>
      </label>
      <label v-if="!tutor" class="font-label-sm text-label-sm text-on-surface">Status
        <select v-model="form.status" class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"><option value="draft">Draft</option><option value="active">Aktif</option><option v-if="initial?.status === 'review'" value="review">Review</option></select>
      </label>
    </div>
    <label class="block font-label-sm text-label-sm text-on-surface">Pertanyaan
      <textarea v-model="form.question" required minlength="5" maxlength="10000" rows="5" placeholder="Tulis pertanyaan..." class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm" />
    </label>
    <fieldset class="space-y-3"><legend class="mb-2 font-label-md text-label-md text-on-surface">Pilihan Jawaban</legend>
      <label v-for="option in form.options" :key="option.key" class="flex items-center gap-3"><input v-model="form.correct_answer" type="radio" name="correct-answer" :value="option.key" :aria-label="`Jawaban benar ${option.key}`" class="h-4 w-4 accent-primary-container"><span class="w-5 shrink-0 font-label-sm text-label-sm text-on-surface">{{ option.key }}</span><input v-model="option.text" required maxlength="3000" :placeholder="`Pilihan ${option.key}`" class="min-w-0 flex-1 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"></label>
      <p class="font-caption text-caption text-on-surface-variant">Pilih lingkaran di samping jawaban yang benar.</p>
    </fieldset>
    <label class="block font-label-sm text-label-sm text-on-surface">Pembahasan
      <textarea v-model="form.explanation" required maxlength="10000" rows="5" placeholder="Jelaskan cara mendapatkan jawaban yang benar..." class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm" />
    </label>
    <p v-if="error" role="alert" class="font-body-sm text-body-sm text-danger-rose">{{ error }}</p>
    <div class="flex justify-end"><button type="submit" :disabled="saving" class="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-5 py-2.5 font-label-sm text-label-sm text-white hover:bg-brand-700 disabled:opacity-60"><LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" /><Save v-else class="h-4 w-4" />{{ tutor && !initial ? 'Kirim untuk Review' : 'Simpan Soal' }}</button></div>
  </form>
</template>
