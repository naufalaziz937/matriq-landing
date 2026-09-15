<script setup>
import { computed } from 'vue';
const props = defineProps({ rows: { type: Array, default: () => [] }, centerLabel: { type: String, default: 'Total' } });
const colors = ['#2563eb','#f59e0b','#16a34a','#8b5cf6','#06b6d4','#64748b'];
const total = computed(() => props.rows.reduce((sum,row) => sum + Number(row.total || 0), 0));
const arcs = computed(() => { let offset=0; return props.rows.map((row,i) => { const length=Number(row.total||0)/Math.max(1,total.value)*100; const arc={...row,color:colors[i%colors.length],length,offset}; offset+=length; return arc; }); });
</script>
<template>
  <div v-if="!total" class="flex h-56 items-center justify-center text-center text-on-surface-variant">Belum cukup data untuk menampilkan analisis ini.</div>
  <div v-else class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
    <svg class="h-44 w-44 shrink-0" viewBox="0 0 120 120" role="img" :aria-label="`${centerLabel}: ${total}`"><circle cx="60" cy="60" r="43" fill="none" stroke="#e2e8f0" stroke-width="16" /><circle v-for="arc in arcs" :key="arc.label" cx="60" cy="60" r="43" fill="none" :stroke="arc.color" stroke-width="16" :stroke-dasharray="`${arc.length*2.702} ${270.2-arc.length*2.702}`" :stroke-dashoffset="-arc.offset*2.702" transform="rotate(-90 60 60)"><title>{{ arc.label }}: {{ arc.total }} ({{ Math.round(arc.length) }}%)</title></circle><text x="60" y="58" text-anchor="middle" font-size="19" font-weight="700" fill="#172554">{{ total }}</text><text x="60" y="74" text-anchor="middle" font-size="9" fill="#64748b">{{ centerLabel }}</text></svg>
    <div class="w-full min-w-0 space-y-2"><div v-for="arc in arcs" :key="arc.label" :title="`${arc.label}: ${arc.total} (${Math.round(arc.length)}%)`" class="flex items-center gap-2 text-sm"><i class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: arc.color }" /><span class="min-w-0 flex-1 truncate">{{ arc.label }}</span><strong>{{ arc.total }}</strong></div></div>
  </div>
</template>
