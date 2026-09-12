<template>
  <div
    class="bg-white rounded-3xl p-5 border border-slate-100 shadow-card flex items-center justify-between card-hover-lift select-none"
    data-purpose="stat-summary"
  >
    <!-- Streak -->
    <div class="flex items-center gap-3">
      <div class="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-xl transform hover:scale-110 transition-transform">
        🔥
      </div>
      <div>
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Streak</span>
        <p class="text-base font-extrabold text-slate-900">{{ streakDays }} Hari</p>
      </div>
    </div>

    <div class="h-8 w-px bg-slate-100"></div>

    <!-- Total Belajar -->
    <div class="flex items-center gap-3">
      <div class="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transform hover:scale-110 transition-transform">
        <Clock class="w-5 h-5 stroke-current" />
      </div>
      <div>
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Belajar</span>
        <p class="text-base font-extrabold text-slate-900">{{ totalHours }} Jam</p>
      </div>
    </div>

    <!-- Action Chevron -->
    <button class="text-slate-300 hover:text-slate-500 pl-1 p-1 hover:bg-slate-50 rounded-full transition-colors">
      <ChevronRight class="w-5 h-5 stroke-[2.5]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Clock, ChevronRight } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    streakDays?: number;
    totalHours?: number;
  }>(),
  {
    streakDays: 7,
    totalHours: 48
  }
);
</script>
