<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in select-none"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 class="text-base font-bold">AI Question Parser</h3>
            <p class="text-[11px] text-blue-100">Ekstraksi otomatis bank soal UTBK dari DOCX & PDF</p>
          </div>
        </div>

        <button @click="$emit('close')" class="p-1 rounded-full hover:bg-white/20 transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Stepper Indicator -->
      <div class="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
        <div class="flex items-center gap-2">
          <span :class="currentStep >= 1 ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]' : 'w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]'">1</span>
          <span :class="currentStep >= 1 ? 'text-blue-600 font-bold' : ''">Upload</span>
        </div>
        <div class="w-8 h-px bg-slate-200"></div>
        <div class="flex items-center gap-2">
          <span :class="currentStep >= 2 ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]' : 'w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]'">2</span>
          <span :class="currentStep >= 2 ? 'text-blue-600 font-bold' : ''">Extract</span>
        </div>
        <div class="w-8 h-px bg-slate-200"></div>
        <div class="flex items-center gap-2">
          <span :class="currentStep >= 3 ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]' : 'w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]'">3</span>
          <span :class="currentStep >= 3 ? 'text-blue-600 font-bold' : ''">AI Parsing</span>
        </div>
        <div class="w-8 h-px bg-slate-200"></div>
        <div class="flex items-center gap-2">
          <span :class="currentStep >= 4 ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]' : 'w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]'">4</span>
          <span :class="currentStep >= 4 ? 'text-blue-600 font-bold' : ''">Preview</span>
        </div>
      </div>

      <!-- Body Content -->
      <div class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        <!-- Step 1: Upload Zone -->
        <div
          v-if="currentStep === 1"
          @click="startSimulatedParsing"
          class="group cursor-pointer rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-5 text-center transition-all hover:border-blue-500 hover:bg-blue-50/80 sm:p-8"
        >
          <div class="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud class="w-8 h-8" />
          </div>
          <h4 class="text-base font-bold text-slate-800">✨ Import Questions via AI</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Drag & drop file DOCX/PDF atau klik untuk memilih file dari komputer Anda.
          </p>

          <div class="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700">
            <FileText class="w-4 h-4" />
            <span>Pilih File (DOCX / PDF)</span>
          </div>

          <p class="text-[11px] text-slate-400 mt-3">Format didukung: PDF, DOCX · Max 10 MB</p>
        </div>

        <!-- Step 2 & 3: Loading Progress -->
        <div v-if="currentStep === 2 || currentStep === 3" class="py-12 text-center space-y-4">
          <div class="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mx-auto"></div>
          <div>
            <h4 class="text-base font-bold text-slate-800">
              {{ currentStep === 2 ? 'Mengekstrak teks & gambar dokumen...' : 'AI sedang menyusun taksonomi & opsi soal...' }}
            </h4>
            <p class="text-xs text-slate-500 mt-1">Menggunakan model inferensi MatrIQ Question Parser</p>
          </div>
        </div>

        <!-- Step 4: Preview Parsed Questions -->
        <div v-if="currentStep === 4" class="space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 class="text-sm font-bold text-slate-900">Hasil Parsing Dokumen</h4>
              <p class="text-xs text-slate-500">Soal_UTBK_Penalaran_Matematika_2026.docx · 3 Soal Ditemukan</p>
            </div>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Status: Valid & Siap Digunakan
            </span>
          </div>

          <div
            v-for="q in parsedQuestions"
            :key="q.id"
            class="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
          >
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="text-xs font-bold text-slate-900">Soal #{{ q.number }}</span>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {{ q.taxonomy }}
                </span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="q.confidence >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  Confidence {{ q.confidence }}% ({{ q.confidenceBadge }})
                </span>
              </div>
            </div>

            <p class="text-xs font-semibold text-slate-800 leading-relaxed">{{ q.question }}</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                v-for="opt in q.options"
                :key="opt.key"
                class="p-2 rounded-xl border flex items-center justify-between"
                :class="opt.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-600'"
              >
                <span><strong>{{ opt.key }}.</strong> {{ opt.text }}</span>
                <CheckCircle2 v-if="opt.isCorrect" class="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div class="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100">
              <strong class="text-slate-700">Pembahasan:</strong> {{ q.explanation }}
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <button
          v-if="currentStep === 4"
          @click="currentStep = 1"
          class="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
        >
          Upload Dokumen Lain
        </button>
        <div v-else></div>

        <button
          v-if="currentStep === 4"
          @click="saveQuestions"
          class="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
        >
          <Check class="w-4 h-4" />
          <span>Simpan ke Bank Soal</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X, Sparkles, UploadCloud, FileText, CheckCircle2, Check } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const currentStep = ref(1);

const parsedQuestions = ref([
  {
    id: 'q-1',
    number: 1,
    taxonomy: 'Penalaran Matematika > Aljabar',
    difficulty: 'SEDANG (HOTS)',
    confidence: 96,
    confidenceBadge: 'High',
    question: 'Diberikan fungsi kuadrat f(x) = ax² + bx + c. Jika f(1) = 4, f(0) = 1, dan f(-1) = 2, berapakah nilai dari f(2)?',
    options: [
      { key: 'A', text: '5' },
      { key: 'B', text: '7' },
      { key: 'C', text: '9', isCorrect: true },
      { key: 'D', text: '11' },
      { key: 'E', text: '13' }
    ],
    explanation: 'Substitusi f(0)=1 menghasilkan c=1. Dari f(1)=4 dan f(-1)=2 didapatkan sistem persamaan a+b=3 dan a-b=1. Maka a=2, b=1. Sehingga f(2)=9.'
  },
  {
    id: 'q-2',
    number: 2,
    taxonomy: 'PBM > Kaidah EYD V',
    difficulty: 'MUDAH',
    confidence: 92,
    confidenceBadge: 'High',
    question: 'Kalimat berikut yang menggunakan ejaan dan tanda baca baku sesuai EYD V adalah...',
    options: [
      { key: 'A', text: 'Meskipun lelah, ia tetap belajar demi mengejar PTN impiannya.', isCorrect: true },
      { key: 'B', text: 'Meskipun lelah tetapi ia tetap belajar demi mengejar PTN impiannya.' },
      { key: 'C', text: 'Ia tetap belajar demi mengejar PTN impiannya, meskipun lelah.' },
      { key: 'D', text: 'Meskipun lelah; ia tetap belajar demi mengejar PTN impiannya.' }
    ],
    explanation: 'Konjungsi "Meskipun" di awal kalimat majemuk bertingkat harus diikuti tanda koma di akhir anak kalimat.'
  }
]);

function startSimulatedParsing() {
  currentStep.value = 2;
  setTimeout(() => {
    currentStep.value = 3;
    setTimeout(() => {
      currentStep.value = 4;
    }, 800);
  }, 700);
}

function saveQuestions() {
  emit('saved');
  emit('close');
  currentStep.value = 1;
}
</script>
