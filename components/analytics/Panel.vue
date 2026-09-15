<script setup>
defineProps({ title: String, subtitle: String, loading: Boolean, error: String });
defineEmits(['retry']);
</script>
<template>
  <section class="analytics-panel min-w-0 rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-6">
    <div class="mb-5"><h3 class="font-title-md text-title-md text-on-surface">{{ title }}</h3><p v-if="subtitle" class="mt-1 font-caption text-caption text-outline">{{ subtitle }}</p></div>
    <div v-if="loading" class="h-48 animate-pulse rounded-2xl bg-surface-container" />
    <div v-else-if="error" class="flex h-40 flex-col items-center justify-center gap-2 text-on-surface-variant"><p>{{ error }}</p><button class="text-primary-container hover:underline" @click="$emit('retry')">Coba lagi</button></div>
    <slot v-else />
  </section>
</template>
<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .analytics-panel { animation: panel-in .35s ease both; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
  .analytics-panel:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,.08); border-color: #bfdbfe; }
  @keyframes panel-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
}
</style>
