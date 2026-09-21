<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, LoaderCircle } from 'lucide-vue-next';
import { useQuestionBankStore } from '~/stores/api/questionBank';

const emit = defineEmits<{ (e: 'close'): void; (e: 'imported'): void }>();

const bank = useQuestionBankStore();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const validating = ref(false);
const importing = ref(false);
const importResult = ref<{ success: boolean; message: string; data: { success: any[]; errors: any[] } } | null>(null);
const preview = ref<{ total: number; valid: number; invalid: number; rows: any[] } | null>(null);
const previewFilter = ref<'all' | 'valid' | 'error'>('all');
const localError = ref('');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileLabel = computed(() => {
  if (!selectedFile.value) return null;
  const size = (selectedFile.value.size / 1024).toFixed(1);
  return `${selectedFile.value.name} (${size} KB)`;
});
const filteredRows = computed(() => preview.value?.rows.filter((row) => previewFilter.value === 'all' || row.status === previewFilter.value) || []);

function onDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}
function onDragLeave() { isDragging.value = false; }
function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) setFile(file);
}
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) setFile(file);
}
function setFile(file: File) {
  localError.value = '';
  importResult.value = null;
  const name = file.name.toLowerCase();
  if (!name.endsWith('.xlsx')) {
    localError.value = 'Format file harus Excel (.xlsx)';
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    localError.value = 'Ukuran file maksimal 5 MB';
    return;
  }
  selectedFile.value = file;
  preview.value = null;
}

async function downloadTemplate() {
  const { url, token } = bank.getTemplateUrl();
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('Gagal mengunduh template');
    const blob = await response.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'template_import_soal.xlsx';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    localError.value = 'Gagal mengunduh template. Coba lagi.';
  }
}

async function validateFile() {
  if (!selectedFile.value || validating.value) return;
  localError.value = '';
  validating.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    const result: any = await bank.validateImport(formData);
    preview.value = result.data;
    previewFilter.value = 'all';
  } catch (err: any) {
    localError.value = err?.data?.message || 'Gagal memvalidasi file soal.';
  } finally {
    validating.value = false;
  }
}

async function doImport() {
  if (!selectedFile.value || importing.value) return;
  if (!preview.value || preview.value.invalid > 0) return;
  if (!window.confirm(`${preview.value.valid} soal siap diimport. Lanjutkan?`)) return;
  localError.value = '';
  importing.value = true;
  importResult.value = null;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    const result: any = await bank.importQuestions(formData);
    importResult.value = result;
    selectedFile.value = null;
    preview.value = null;
    if (result?.data?.success?.length > 0) {
      emit('imported');
    }
  } catch (err: any) {
    localError.value = err?.data?.message || bank.error || 'Gagal mengimpor soal.';
  } finally {
    importing.value = false;
  }
}

function reset() {
  selectedFile.value = null;
  preview.value = null;
  importResult.value = null;
  localError.value = '';
  previewFilter.value = 'all';
  if (fileInput.value) fileInput.value.value = '';
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4"
    @click.self="emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Import soal dari Excel"
      class="flex w-full max-w-xl flex-col rounded-3xl bg-white shadow-2xl"
      style="max-height: 90dvh"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-soft-blue px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-pale-blue">
            <FileSpreadsheet class="h-5 w-5 text-primary-container" />
          </div>
          <div>
            <h2 class="font-title-md text-title-md text-on-surface">Import Soal dari Excel</h2>
            <p class="font-caption text-caption text-outline">Unggah file .xlsx, maksimal 500 soal per file</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Tutup modal"
          class="rounded-xl p-2 text-outline hover:bg-surface-container-low"
          @click="emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        <!-- Download template -->
        <div class="flex items-center justify-between rounded-2xl border border-soft-blue bg-surface-container-low px-4 py-3">
          <div>
            <p class="font-label-sm text-label-sm text-on-surface">Belum punya template?</p>
            <p class="font-caption text-caption text-outline">Unduh template Excel resmi MatrIQ</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-2xl border border-primary-container px-4 py-2 font-label-sm text-label-sm text-primary-container hover:bg-pale-blue transition-colors"
            @click="downloadTemplate"
          >
            <Download class="h-4 w-4" />
            Unduh Template
          </button>
        </div>

        <!-- Drop zone -->
        <div
          v-if="!importResult && !preview"
          class="relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
          :class="isDragging ? 'border-primary-container bg-pale-blue' : 'border-outline-variant bg-surface-container-low hover:border-primary-container hover:bg-pale-blue'"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
          @click="fileInput?.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx"
            class="sr-only"
            @change="onFileChange"
          />
          <Upload class="mb-3 h-9 w-9 text-primary-container" />
          <p class="font-label-md text-label-md text-on-surface">
            {{ selectedFile ? 'Ganti file' : 'Klik atau drag & drop file di sini' }}
          </p>
          <p class="mt-1 font-caption text-caption text-outline">Mendukung .xlsx · Maks 5 MB · 500 soal</p>
        </div>

        <!-- Selected file chip -->
        <div
          v-if="selectedFile && !importResult"
          class="flex items-center gap-3 rounded-2xl border border-soft-blue bg-surface-container-low px-4 py-3"
        >
          <FileSpreadsheet class="h-5 w-5 shrink-0 text-success-emerald" />
          <span class="min-w-0 flex-1 truncate font-body-sm text-body-sm text-on-surface">{{ fileLabel }}</span>
          <button
            type="button"
            aria-label="Hapus file"
            class="rounded-lg p-1 text-outline hover:text-danger-rose"
            @click.stop="reset"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Local error -->
        <p v-if="localError" role="alert" class="rounded-2xl bg-danger-soft px-4 py-3 font-body-sm text-body-sm text-danger-rose">
          {{ localError }}
        </p>

        <!-- Validation preview -->
        <div v-if="preview && !importResult" class="space-y-4">
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="rounded-2xl bg-surface-container-low p-3"><strong class="block text-on-surface">{{ preview.total }}</strong><span class="font-caption text-caption text-outline">Ditemukan</span></div>
            <div class="rounded-2xl bg-success-soft p-3"><strong class="block text-success-emerald">{{ preview.valid }}</strong><span class="font-caption text-caption text-outline">Valid</span></div>
            <div class="rounded-2xl bg-danger-soft p-3"><strong class="block text-danger-rose">{{ preview.invalid }}</strong><span class="font-caption text-caption text-outline">Error</span></div>
          </div>
          <div class="flex gap-2">
            <button v-for="item in [{value:'all',label:'Semua'},{value:'valid',label:'Valid'},{value:'error',label:'Error'}]" :key="item.value" type="button" class="rounded-xl px-3 py-2 font-caption text-caption" :class="previewFilter === item.value ? 'bg-primary-container text-white' : 'bg-surface-container text-on-surface-variant'" @click="previewFilter = item.value as any">{{ item.label }}</button>
          </div>
          <div class="max-h-72 overflow-auto rounded-2xl border border-soft-blue">
            <table class="w-full min-w-[620px] text-left font-caption text-caption">
              <thead class="sticky top-0 bg-surface-container-low text-outline"><tr><th class="p-3">Baris</th><th class="p-3">Subtes</th><th class="p-3">Kategori</th><th class="p-3">Level</th><th class="p-3">Pertanyaan</th><th class="p-3">Status</th></tr></thead>
              <tbody class="divide-y divide-soft-blue"><tr v-for="row in filteredRows" :key="row.row"><td class="p-3">{{ row.row }}</td><td class="p-3">{{ row.data?.subtest || '—' }}</td><td class="p-3">{{ row.data?.category || '—' }}</td><td class="p-3">{{ row.data?.difficulty_level || '—' }}</td><td class="max-w-52 p-3"><p class="line-clamp-2">{{ row.data?.question || '—' }}</p><p v-if="row.error" class="mt-1 text-danger-rose">{{ row.error }}</p></td><td class="p-3"><span class="rounded-full px-2 py-1" :class="row.status === 'valid' ? 'bg-success-soft text-success-emerald' : 'bg-danger-soft text-danger-rose'">{{ row.status === 'valid' ? 'Valid' : 'Error' }}</span></td></tr></tbody>
            </table>
          </div>
          <p v-if="preview.invalid" role="alert" class="rounded-2xl bg-danger-soft px-4 py-3 font-body-sm text-body-sm text-danger-rose">Perbaiki semua baris error pada file, lalu unggah ulang. Import dinonaktifkan agar tidak terjadi penyimpanan sebagian.</p>
        </div>

        <!-- Import result -->
        <div v-if="importResult" class="space-y-3">
          <!-- Summary banner -->
          <div
            class="flex items-start gap-3 rounded-2xl px-4 py-3"
            :class="importResult.data.errors.length === 0 ? 'bg-success-soft' : importResult.data.success.length > 0 ? 'bg-soft-orange' : 'bg-danger-soft'"
          >
            <CheckCircle2
              v-if="importResult.data.errors.length === 0"
              class="mt-0.5 h-5 w-5 shrink-0 text-success-emerald"
            />
            <AlertCircle v-else class="mt-0.5 h-5 w-5 shrink-0" :class="importResult.data.success.length > 0 ? 'text-on-secondary-container' : 'text-danger-rose'" />
            <div>
              <p class="font-label-sm text-label-sm text-on-surface">{{ importResult.message }}</p>
              <p class="mt-1 font-caption text-caption text-outline">
                {{ importResult.data.success.length }} soal berhasil ·
                {{ importResult.data.errors.length }} soal gagal
              </p>
            </div>
          </div>

          <p class="rounded-2xl border border-soft-blue bg-surface-container-low px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{{ importResult.data.success.length }} soal diproses · {{ importResult.data.success.length }} berhasil diimport · 0 gagal</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between border-t border-soft-blue px-6 py-4">
        <button
          v-if="importResult"
          type="button"
          class="rounded-2xl border border-outline-variant px-4 py-2.5 font-label-sm text-label-sm text-on-surface hover:bg-surface-container-low"
          @click="reset"
        >
          Import Lagi
        </button>
        <button
          v-else
          type="button"
          class="rounded-2xl border border-outline-variant px-4 py-2.5 font-label-sm text-label-sm text-on-surface hover:bg-surface-container-low"
          @click="emit('close')"
        >
          Batal
        </button>

        <button
          v-if="!importResult && !preview"
          type="button"
          :disabled="!selectedFile || validating"
          class="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-5 py-2.5 font-label-sm text-label-sm text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          @click="validateFile"
        >
          <LoaderCircle v-if="validating" class="h-4 w-4 animate-spin" />
          <Upload v-else class="h-4 w-4" />
          {{ validating ? 'Memvalidasi...' : 'Parse & Validasi' }}
        </button>
        <button
          v-else-if="preview"
          type="button"
          :disabled="preview.invalid > 0 || importing"
          class="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-5 py-2.5 font-label-sm text-label-sm text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          @click="doImport"
        >
          <LoaderCircle v-if="importing" class="h-4 w-4 animate-spin" />
          <Upload v-else class="h-4 w-4" />
          {{ importing ? 'Mengimpor...' : `Import ${preview.valid} Soal` }}
        </button>
        <button
          v-else
          type="button"
          class="rounded-2xl bg-primary-container px-5 py-2.5 font-label-sm text-label-sm text-white hover:bg-brand-700"
          @click="emit('close')"
        >
          Selesai
        </button>
      </div>
    </div>
  </div>
</template>
