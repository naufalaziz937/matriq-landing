<template>
  <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-card card-hover-lift select-none" data-purpose="overall-progress">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-bold text-slate-900">Progres Keseluruhan</h3>
      <a class="text-xs font-semibold text-blue-600 hover:underline cursor-pointer" @click="$emit('view-all-progress')">
        Lihat Semua
      </a>
    </div>

    <div class="flex items-center gap-6 py-2">
      <!-- Circular Progress Donut -->
      <div class="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <svg class="w-full h-full donut-chart" viewBox="0 0 100 100">
          <!-- Background track -->
          <circle cx="50" cy="50" fill="transparent" r="40" stroke="#F1F5F9" stroke-width="9" />
          <!-- Animated Progress 68% -> circumference = 2 * PI * 40 ≈ 251.32. Dashoffset = 251.32 * (1 - pct/100) -->
          <circle
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            stroke="url(#progress-gradient)"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            stroke-linecap="round"
            stroke-width="9"
            class="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="progress-gradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stop-color="#2563EB" />
              <stop offset="70%" stop-color="#0284C7" />
              <stop offset="100%" stop-color="#0D9488" />
            </linearGradient>
          </defs>
        </svg>

        <!-- Center Text Percentage -->
        <div class="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span class="text-2xl font-black text-slate-900 leading-none">{{ percentage }}%</span>
          <span class="text-[10px] text-slate-400 font-semibold mt-0.5">Selesai</span>
        </div>
      </div>

      <!-- Legends and Statistics Breakdown -->
      <div class="flex-1 space-y-2.5 text-xs font-medium">
        <div
          v-for="cat in categories"
          :key="cat.name"
          class="flex items-center justify-between hover:bg-slate-50 p-1 rounded-lg transition-colors"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="cat.color"></span>
            <span class="text-slate-600 font-semibold">{{ cat.name }}</span>
          </div>
          <span class="font-bold text-slate-900">
            {{ cat.completed }}<span class="text-slate-400 font-normal">/{{ cat.total }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    percentage?: number;
    categories?: Array<{
      name: string;
      completed: number;
      total: number;
      color: string;
    }>;
  }>(),
  {
    percentage: 68,
    categories: () => [
      { name: 'Materi', completed: 12, total: 18, color: 'bg-blue-600' },
      { name: 'Latihan Soal', completed: 342, total: 500, color: 'bg-amber-400' },
      { name: 'Tryout', completed: 3, total: 5, color: 'bg-teal-500' }
    ]
  }
);

defineEmits<{
  (e: 'view-all-progress'): void;
}>();

const radius = 40;
const circumference = 2 * Math.PI * radius; // ≈ 251.32

const strokeDashoffset = computed(() => {
  return circumference * (1 - (props.percentage || 0) / 100);
});
</script>
