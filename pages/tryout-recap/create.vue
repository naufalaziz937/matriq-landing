<script setup>
import { onMounted, ref } from 'vue';
import RecapForm from '~/components/tryout-recap/RecapForm.vue';
import { useAuthStore } from '~/stores/api/auth';
import { canAccessPage } from '~/utils/roles';
definePageMeta({ layout: 'default' });
const ready = ref(false), auth = useAuthStore();
onMounted(async () => { auth.initializeAuth(); if (!auth.token) return navigateTo('/login'); const user = await auth.fetchCurrentUser(); if (Number(user?.role) !== 2 || !canAccessPage(user?.role, 'tryout-recap.self')) return navigateTo('/dashboard'); ready.value = true; });
</script>
<template><RecapForm v-if="ready" /><div v-else class="p-6"><div class="h-64 animate-pulse rounded-3xl bg-slate-200" /></div></template>
