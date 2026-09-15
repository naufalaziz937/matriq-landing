<script setup>
import { computed } from 'vue';
const props = defineProps({ rows: { type: Array, default: () => [] }, series: { type: Array, default: () => [] }, area: Boolean });
const colors = ['#2563eb', '#f59e0b', '#16a34a'];
const values = computed(() => props.rows.flatMap(row => props.series.map(s => Number(row[s.key]) || 0)));
const hasData = computed(() => values.value.some(value => value > 0));
const ceiling = computed(() => Math.max(1, ...values.value) * 1.1);
const x = index => 42 + index * 570 / Math.max(1, props.rows.length - 1);
const y = value => 200 - (Number(value) || 0) / ceiling.value * 165;
const lines = computed(() => props.series.map((s, i) => {
  const points = props.rows.map((row, index) => `${x(index)},${y(row[s.key])}`);
  return { ...s, color: colors[i % colors.length], points: points.join(' '),
    areaPath: points.length ? `M ${points.join(' L ')} L ${x(props.rows.length - 1)},200 L 42,200 Z` : '' };
}));
function label(value) { return value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''; }
</script>
<template>
  <div v-if="!hasData" class="flex h-56 items-center justify-center text-center font-body-sm text-body-sm text-on-surface-variant">Belum cukup data untuk menampilkan analisis ini.</div>
  <div v-else class="min-w-0">
    <svg class="w-full overflow-visible" viewBox="0 0 640 225" role="img" :aria-label="series.map(x => x.label).join(', ')">
      <line v-for="level in [0,1,2,3,4]" :key="level" x1="42" x2="612" :y1="200-level*40" :y2="200-level*40" stroke="#e2e8f0" stroke-dasharray="4 5" />
      <text v-for="level in [0,2,4]" :key="level" x="0" :y="204-level*40" fill="#64748b" font-size="11">{{ Math.round(ceiling*level/4) }}</text>
      <g v-for="line in lines" :key="line.key">
        <path v-if="area" :d="line.areaPath" :fill="line.color" fill-opacity=".11" />
        <polyline :points="line.points" fill="none" :stroke="line.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <circle v-for="(row,index) in rows" :key="index" :cx="x(index)" :cy="y(row[line.key])" r="5" :fill="line.color" class="opacity-0 hover:opacity-100 focus:opacity-100" tabindex="0"><title>{{ label(row.day) }} · {{ line.label }}: {{ row[line.key] ?? 0 }}</title></circle>
      </g>
      <text x="42" y="220" fill="#64748b" font-size="11">{{ label(rows[0]?.day) }}</text><text x="612" y="220" text-anchor="end" fill="#64748b" font-size="11">{{ label(rows[rows.length-1]?.day) }}</text>
    </svg>
    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant"><span v-for="line in lines" :key="line.key" class="inline-flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: line.color }" />{{ line.label }}</span></div>
  </div>
</template>
