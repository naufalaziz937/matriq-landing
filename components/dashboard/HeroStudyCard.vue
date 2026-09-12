<template>
  <div
    class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-500 p-5 text-white shadow-lg shadow-blue-500/20 card-hover-lift sm:p-7"
    data-purpose="study-target-card"
  >
    <!-- Background glowing ambient blobs -->
    <div class="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
    <div class="absolute left-1/3 top-2 w-48 h-48 rounded-full bg-sky-400/20 blur-xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="max-w-md">
        <span class="text-blue-100 text-sm font-medium tracking-wide">Target Belajar Hari Ini</span>
        <h2 class="mt-1 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
          {{ completedCount }} / {{ targetCount }} Soal
        </h2>

        <!-- Progress bar and percentage -->
        <div class="mt-3 mb-2">
          <div class="flex items-center justify-between text-xs font-semibold text-blue-100 mb-1.5">
            <span>Kesiapan Harian</span>
            <span class="font-bold text-white">{{ percentage }}% Selesai</span>
          </div>
          <div class="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              class="bg-amber-400 h-full rounded-full transition-all duration-700 ease-out"
              :style="{ width: `${percentage}%` }"
            ></div>
          </div>
        </div>

        <p class="text-blue-100 text-xs sm:text-sm font-normal mt-2 leading-relaxed opacity-95">
          {{ subtext }}
        </p>

        <!-- CTA Button -->
        <div class="mt-5">
          <button
            @click="$emit('start-practice')"
            class="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-md transition-all duration-200 transform hover:-translate-y-0.5 hover:bg-amber-300 active:scale-95 btn-press sm:w-auto"
          >
            <Rocket class="w-4 h-4 fill-current text-slate-900" />
            <span>Lanjutkan Belajar</span>
            <ArrowRight class="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      <!-- Mascot: slide.svg -->
      <div class="relative -mb-8 -mr-6 h-44 w-44 shrink-0 self-center sm:h-52 sm:w-52 md:-mb-7 md:-mr-8 md:h-60 md:w-60 md:self-end">
        <img
          src="/mascot/slide.svg"
          alt="MatrIQ Mascot"
          class="w-full h-full object-contain object-bottom hover:scale-105 transition-transform duration-300 select-none cursor-pointer drop-shadow-lg"
          draggable="false"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Rocket, ArrowRight } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    completedCount?: number;
    targetCount?: number;
    subtext?: string;
  }>(),
  {
    completedCount: 40,
    targetCount: 50,
    subtext: 'Selesaikan 10 soal Penalaran Matematika lagi untuk mencapai target harianmu!'
  }
);

defineEmits<{
  (e: 'start-practice'): void;
}>();

const percentage = computed(() => {
  if (!props.targetCount) return 0;
  return Math.min(100, Math.round((props.completedCount / props.targetCount) * 100));
});
</script>
