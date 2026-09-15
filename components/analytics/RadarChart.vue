<script setup>
import { computed } from 'vue';
const props = defineProps({ rows: { type: Array, default: () => [] } });
const max = computed(() => Math.max(1,...props.rows.map(row => Number(row.total)||0)));
const point = (index,ratio=1) => { const angle=-Math.PI/2+index*2*Math.PI/Math.max(1,props.rows.length); return [120+Math.cos(angle)*83*ratio,120+Math.sin(angle)*83*ratio]; };
const polygon = computed(() => props.rows.map((row,index) => point(index,(Number(row.total)||0)/max.value).join(',')).join(' '));
const grid = ratio => props.rows.map((_,index) => point(index,ratio).join(',')).join(' ');
</script>
<template>
  <div v-if="!rows.some(row => Number(row.total)>0)" class="flex h-56 items-center justify-center text-center text-on-surface-variant">Belum cukup data untuk menampilkan analisis ini.</div>
  <svg v-else class="mx-auto h-64 w-full max-w-72" viewBox="0 0 240 240" role="img" aria-label="Perbandingan rata-rata tujuh subtes"><polygon v-for="ratio in [.25,.5,.75,1]" :key="ratio" :points="grid(ratio)" fill="none" stroke="#cbd5e1" /><line v-for="(_,i) in rows" :key="i" x1="120" y1="120" :x2="point(i)[0]" :y2="point(i)[1]" stroke="#e2e8f0" /><polygon :points="polygon" fill="#2563eb" fill-opacity=".22" stroke="#2563eb" stroke-width="2"><title>{{ rows.map(row => `${row.label}: ${row.total}`).join(', ') }}</title></polygon><text v-for="(row,i) in rows" :key="row.label" :x="point(i,1.22)[0]" :y="point(i,1.22)[1]" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#334155">{{ row.label }}</text></svg>
</template>
