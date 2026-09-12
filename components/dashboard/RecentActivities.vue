<template>
  <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-card card-hover-lift select-none" data-purpose="recent-learning-activity">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-bold text-slate-900">Aktivitas Belajar Terbaru</h3>
      <a class="text-xs font-semibold text-blue-600 hover:underline cursor-pointer" @click="$emit('view-all-activities')">
        Lihat Semua
      </a>
    </div>

    <div class="space-y-4">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-center justify-between hover:bg-slate-50 p-2 rounded-2xl transition-colors group cursor-pointer"
      >
        <div class="flex items-center gap-3">
          <!-- Icon Container -->
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            :class="activity.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'"
          >
            <component :is="getIcon(activity.icon_type)" class="w-4 h-4 stroke-current" />
          </div>

          <div>
            <h5 class="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {{ activity.title }}
            </h5>
            <p class="text-[11px] text-slate-400 font-medium">
              {{ activity.subtitle }}
            </p>
          </div>
        </div>

        <span
          class="text-xs font-semibold"
          :class="activity.badge_type === 'success' ? 'text-emerald-600' : 'text-slate-400 font-medium'"
        >
          {{ activity.time_ago }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PenTool, Award, BookOpen, CheckCircle2 } from 'lucide-vue-next';

interface Activity {
  id: number;
  title: string;
  subtitle: string;
  time_ago: string;
  badge_type?: string;
  icon_type?: string;
  color?: string;
}

withDefaults(
  defineProps<{
    activities?: Activity[];
  }>(),
  {
    activities: () => []
  }
);

defineEmits<{
  (e: 'view-all-activities'): void;
}>();

function getIcon(type?: string) {
  switch (type) {
    case 'tryout':
      return Award;
    case 'reading':
      return BookOpen;
    case 'math':
    default:
      return PenTool;
  }
}
</script>
