<script setup>
import { onMounted, ref } from 'vue';
import AdminMaterialsPage from '~/components/materials/AdminMaterialsPage.vue';
import UserMaterialsPage from '~/components/materials/UserMaterialsPage.vue';
import { useAuthStore } from '~/stores/api/auth';
import { canAccessPage } from '~/utils/roles';
definePageMeta({ layout: 'default' });
const auth = useAuthStore(), role = ref(null);
onMounted(async () => {
  auth.initializeAuth();
  if (!auth.token) return navigateTo('/login');
  const user = await auth.fetchCurrentUser();
  if (!canAccessPage(user?.role, 'materials')) return navigateTo('/dashboard');
  role.value = Number(user.role);
});
</script>
<template><AdminMaterialsPage v-if="role === 1" /><UserMaterialsPage v-else-if="role === 2" /><div v-else class="mx-auto max-w-7xl p-6"><div class="h-64 animate-pulse rounded-3xl bg-slate-200" /></div></template>
