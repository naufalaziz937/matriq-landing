<script setup>
import { computed } from 'vue';
const props = defineProps({ rows: { type: Array, default: () => [] } });
const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
const index = computed(() => new Map(props.rows.map(row => [`${row.weekday}-${row.hour_of_day}`,Number(row.total)||0])));
const max = computed(() => Math.max(1,...props.rows.map(row => Number(row.total)||0)));
const color = value => !value ? '#e2e8f0' : `rgba(37,99,235,${.2+.8*value/max.value})`;
</script>
<template>
  <div v-if="!rows.length" class="flex h-48 items-center justify-center text-center text-on-surface-variant">Belum ada rekap tryout pada periode ini.</div>
  <div v-else class="overflow-x-auto"><div class="min-w-[610px]"><div class="mb-1 grid grid-cols-[34px_repeat(24,1fr)] gap-1 text-[10px] text-outline"><span /><span v-for="hour in 24" :key="hour" class="text-center">{{ (hour-1)%3===0 ? hour-1 : '' }}</span></div><div v-for="(day,di) in days" :key="day" class="mb-1 grid grid-cols-[34px_repeat(24,1fr)] items-center gap-1"><span class="text-[10px] text-outline">{{ day }}</span><div v-for="hour in 24" :key="hour" class="aspect-square rounded-[3px]" :style="{ backgroundColor: color(index.get(`${di+1}-${hour-1}`)||0) }" :title="`${day} ${String(hour-1).padStart(2,'0')}:00 · ${index.get(`${di+1}-${hour-1}`)||0} rekap`" /></div><p class="mt-3 text-xs text-outline">Jam WIB · intensitas pencatatan rekap tryout, bukan durasi belajar.</p></div></div>
</template>
