<script setup>
import { computed } from 'vue';
const props = defineProps({ rows: { type: Array, default: () => [] }, max: { type: Number, default: 0 }, accent: { type: String, default: '#2563eb' } });
const ceiling = computed(() => props.max || Math.max(1,...props.rows.map(row => Number(row.total)||0)));
const hasData = computed(() => props.rows.some(row => Number(row.total)>0));
</script>
<template>
  <div v-if="!hasData" class="flex h-48 items-center justify-center text-center text-on-surface-variant">Belum cukup data untuk menampilkan analisis ini.</div>
  <div v-else class="space-y-3"><div v-for="row in rows" :key="row.label" :title="`${row.label}: ${row.total}`"><div class="mb-1 flex justify-between gap-3 text-sm"><span class="min-w-0 truncate text-on-surface-variant">{{ row.label }}</span><strong class="shrink-0 text-on-surface">{{ row.total }}</strong></div><div class="h-2.5 overflow-hidden rounded-full bg-surface-container"><div class="analytics-bar h-full rounded-full" :style="{ width: `${Math.max(0,Math.min(100,Number(row.total)/ceiling*100))}%`, backgroundColor: accent }" /></div></div></div>
</template>
<style scoped>
@media (prefers-reduced-motion: no-preference) { .analytics-bar { animation: reveal .45s ease both; transform-origin: left; } @keyframes reveal { from { transform: scaleX(0); } to { transform: scaleX(1); } } }
</style>
