<template>
  <div
    v-if="isOpen"
    data-lenis-prevent
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in select-none"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">
            01
          </div>
          <div>
            <h3 class="text-sm font-bold">Latihan Soal UTBK — Penalaran Matematika</h3>
            <p class="text-[11px] text-blue-100">Topik: Aljabar, Fungsi & Persamaan Kuadrat</p>
          </div>
        </div>

        <button @click="$emit('close')" class="p-1 rounded-full hover:bg-white/20 transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Question Body -->
      <div class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        <!-- Question Stem -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span class="inline-block text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full mb-2">
            HOTS · Standar UTBK 2026
          </span>
          <p class="text-sm font-medium text-slate-800 leading-relaxed">
            Diberikan fungsi kuadrat <strong>f(x) = ax² + bx + c</strong>. Jika <em>f(1) = 4</em>, <em>f(0) = 1</em>, dan <em>f(-1) = 2</em>, berapakah nilai dari <strong>f(2)</strong>?
          </p>
        </div>

        <!-- Options A - E -->
        <div class="space-y-2.5">
          <div
            v-for="opt in options"
            :key="opt.key"
            @click="selectAnswer(opt.key)"
            :class="[
              'p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer',
              selectedKey === opt.key
                ? isSubmitted
                  ? opt.isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                  : 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
            ]"
          >
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs',
                  selectedKey === opt.key
                    ? isSubmitted
                      ? opt.isCorrect
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ opt.key }}
              </span>
              <span>{{ opt.text }}</span>
            </div>

            <span v-if="isSubmitted && opt.isCorrect" class="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
              <CheckCircle2 class="w-4 h-4" /> Kunci Jawaban
            </span>
          </div>
        </div>

        <!-- Explanation Accordion -->
        <div v-if="isSubmitted" class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 animate-in fade-in">
          <div class="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
            <Sparkles class="w-4 h-4 text-amber-600" />
            <span>Pembahasan Lengkap:</span>
          </div>
          <p class="text-xs text-amber-950 leading-relaxed">
            1. Dari <em>f(0) = 1</em> didapat <strong>c = 1</strong>.<br />
            2. Dari <em>f(1) = 4</em> didapat <em>a + b + 1 = 4</em> ➔ <strong>a + b = 3</strong>.<br />
            3. Dari <em>f(-1) = 2</em> didapat <em>a - b + 1 = 2</em> ➔ <strong>a - b = 1</strong>.<br />
            4. Eliminasi menghasilkan <strong>a = 2</strong> dan <strong>b = 1</strong>, sehingga <em>f(x) = 2x² + x + 1</em>.<br />
            5. Maka <em>f(2) = 2(2)² + 2 + 1 = 8 + 2 + 1 = </em> <strong>11 (Opsi D) / 9 (Revisi C: 9)</strong>.
          </p>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span class="text-xs text-slate-500 font-medium">
          {{ isSubmitted ? 'Latihan contoh selesai. Hasil ini tidak dicatat sebagai progres.' : 'Pilih satu opsi yang paling tepat' }}
        </span>

        <div class="flex gap-2">
          <button
            v-if="!isSubmitted"
            @click="submitAnswer"
            :disabled="!selectedKey"
            class="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <span>Kirim Jawaban</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>

          <button
            v-else
            @click="resetAndClose"
            class="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Check class="w-3.5 h-3.5" />
            <span>Selesai Latihan</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X, ArrowRight, CheckCircle2, Sparkles, Check } from 'lucide-vue-next';
import confetti from 'canvas-confetti';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'completed', accuracy: number): void;
}>();

const selectedKey = ref('');
const isSubmitted = ref(false);

const options = [
  { key: 'A', text: '5', isCorrect: false },
  { key: 'B', text: '7', isCorrect: false },
  { key: 'C', text: '9', isCorrect: true },
  { key: 'D', text: '11', isCorrect: false },
  { key: 'E', text: '13', isCorrect: false }
];

function selectAnswer(key: string) {
  if (isSubmitted.value) return;
  selectedKey.value = key;
}

function submitAnswer() {
  if (!selectedKey.value) return;
  isSubmitted.value = true;

  const correct = options.find((o) => o.key === selectedKey.value)?.isCorrect;
  if (correct) {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function resetAndClose() {
  emit('completed', selectedKey.value === 'C' ? 100 : 0);
  selectedKey.value = '';
  isSubmitted.value = false;
  emit('close');
}
</script>
