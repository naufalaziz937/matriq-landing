<script setup>
import { computed } from 'vue';
const props = defineProps({ rows: { type: Array, default: () => [] }, target: { type: Number, default: null } });
const score = value => Number(value).toLocaleString('id-ID', { maximumFractionDigits: 1 });
const date = value => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const ceiling = computed(() => Math.max(100, Number(props.target) || 0, ...props.rows.map(row => Number(row.total_score))) * 1.08);
const x = index => 42 + index * 570 / Math.max(1, props.rows.length - 1);
const y = value => 200 - Number(value) / ceiling.value * 165;
const points = computed(() => props.rows.map((row, index) => `${x(index)},${y(row.total_score)}`).join(' '));
</script>
<template>
  <div v-if="!rows.length" class="flex h-56 items-center justify-center text-center text-sm text-on-surface-variant">Belum ada rekap tryout eksternal pada periode ini.</div>
  <div v-else class="min-w-0"><svg class="w-full overflow-visible" viewBox="0 0 640 225" role="img" aria-label="Tren skor tryout eksternal dan target skor"><line v-for="level in [0,1,2,3,4]" :key="level" x1="42" x2="612" :y1="200-level*40" :y2="200-level*40" stroke="#e2e8f0" stroke-dasharray="4 5" /><text v-for="level in [0,2,4]" :key="level" x="0" :y="204-level*40" fill="#64748b" font-size="11">{{ Math.round(ceiling*level/4) }}</text><line v-if="target != null" x1="42" x2="612" :y1="y(target)" :y2="y(target)" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 5" /><text v-if="target != null" x="610" :y="Math.max(10,y(target)-5)" text-anchor="end" fill="#b45309" font-size="11">Target {{ score(target) }}</text><polyline v-if="rows.length > 1" :points="points" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /><circle v-for="(row,index) in rows" :key="index" :cx="x(index)" :cy="y(row.total_score)" r="5" fill="#2563eb" tabindex="0"><title>{{ date(row.recap_at) }} · {{ row.platform || 'Platform tidak diketahui' }} · {{ row.tryout_name || 'Tryout eksternal' }} · Skor {{ score(row.total_score) }}{{ row.delta == null ? '' : ` · ${row.delta >= 0 ? '+' : ''}${score(row.delta)} poin` }}</title></circle><text x="42" y="220" fill="#64748b" font-size="11">{{ date(rows[0].recap_at) }}</text><text x="612" y="220" text-anchor="end" fill="#64748b" font-size="11">{{ date(rows[rows.length - 1].recap_at) }}</text></svg><div class="mt-2 flex gap-4 text-xs text-on-surface-variant"><span>● Skor tryout</span><span v-if="target != null" class="text-amber-700">┄ Target</span></div></div>
</template>
