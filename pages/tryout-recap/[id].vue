<script setup>
import { onMounted, ref } from 'vue';
import RecapForm from '~/components/tryout-recap/RecapForm.vue';
import { useAuthStore } from '~/stores/api/auth';
import { useUserTryoutRecapStore } from '~/stores/api/userTryoutRecap';
import { canAccessPage } from '~/utils/roles';
definePageMeta({ layout: 'default' });
const auth = useAuthStore(), store = useUserTryoutRecapStore(), route = useRoute(), ready = ref(false);
onMounted(async () => { auth.initializeAuth(); if (!auth.token) return navigateTo('/login'); const user = await auth.fetchCurrentUser(); if (Number(user?.role) !== 2 || !canAccessPage(user?.role, 'tryout-recap.self')) return navigateTo('/dashboard'); ready.value = true; await store.fetchDetail(route.params.id); });
</script>
<template><RecapForm v-if="ready && store.selectedRecap" :recap="store.selectedRecap" /><div v-else-if="store.error" class="p-6 text-rose-700" role="alert">{{ store.error }} <NuxtLink to="/tryout-recap" class="underline">Kembali</NuxtLink></div><div v-else class="p-6"><div class="h-64 animate-pulse rounded-3xl bg-slate-200" /></div></template>
