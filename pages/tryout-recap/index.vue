<script setup>
import { onMounted, ref } from 'vue';
import AdminRecapPage from '~/components/tryout-recap/AdminRecapPage.vue';
import UserRecapPage from '~/components/tryout-recap/UserRecapPage.vue';
import { useAuthStore } from '~/stores/api/auth';
import { canAccessPage } from '~/utils/roles';
definePageMeta({ layout: 'default' });
const auth = useAuthStore();
const role = ref(null);
onMounted(async () => {
  auth.initializeAuth();
  if (!auth.token) return navigateTo('/login');
  const user = await auth.fetchCurrentUser();
  if (!canAccessPage(user?.role, 'tryout-recap')) return navigateTo('/dashboard');
  role.value = Number(user.role);
});
</script>
<template>
  <AdminRecapPage v-if="role === 1" />
  <UserRecapPage v-else-if="role === 2" />
  <div v-else class="mx-auto max-w-7xl p-6"><div class="h-64 animate-pulse rounded-3xl bg-slate-200" /></div>
</template>
