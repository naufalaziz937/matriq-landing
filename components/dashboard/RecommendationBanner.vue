<template>
  <div
    class="bg-blue-50/70 border border-blue-100/90 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden card-hover-lift select-none"
    data-purpose="recommendation-banner"
  >
    <div class="flex items-center gap-4">
      <div
        class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 transform hover:rotate-12 transition-transform"
      >
        <!-- Target / Bullseye icon -->
        <Target class="w-6 h-6 stroke-current" />
      </div>
      <div>
        <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-100/70 px-2.5 py-0.5 rounded-full mb-1">
          ✦ {{ recommendation?.tag || 'Rekomendasi Belajar' }}
        </span>
        <h4 class="text-sm font-bold text-slate-900 leading-snug">
          {{ recommendation?.title || 'Kamu perlu fokus ke Materi Aljabar di Penalaran Matematika.' }}
        </h4>
        <p class="text-xs text-slate-500 font-medium">
          {{ recommendation?.description || 'Akurasi kamu masih 58% dari 42 soal terakhir.' }}
        </p>
      </div>
    </div>

    <button
      @click="$emit('open-recommendation')"
      class="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 text-xs font-bold shadow-sm transition-all hover:shadow hover:scale-105 active:scale-95 btn-press"
    >
      <span>{{ recommendation?.action_text || 'Lihat Rekomendasi' }}</span>
      <ArrowRight class="w-3.5 h-3.5 stroke-[2.5]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Target, ArrowRight } from 'lucide-vue-next';

defineProps<{
  recommendation?: {
    tag?: string;
    title?: string;
    description?: string;
    action_text?: string;
  };
}>();

defineEmits<{
  (e: 'open-recommendation'): void;
}>();
</script>
