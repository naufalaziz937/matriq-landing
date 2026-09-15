<script setup>
import { onMounted, ref } from 'vue';
import AdminAnalyticsPage from '~/components/analytics/AdminAnalyticsPage.vue';
import UserAnalyticsPage from '~/components/analytics/UserAnalyticsPage.vue';
import { useAuthStore } from '~/stores/api/auth';
import { canAccessPage } from '~/utils/roles';
definePageMeta({ layout: 'default' });
const auth = useAuthStore(), role = ref(null);
onMounted(async () => {
  auth.initializeAuth();
  if (!auth.token) return navigateTo('/login');
  const user = await auth.fetchCurrentUser();
  if (!canAccessPage(user?.role, 'analytics')) return navigateTo('/dashboard');
  role.value = Number(user.role);
});
</script>
<template>
  <AdminAnalyticsPage v-if="role === 1" />
  <UserAnalyticsPage v-else-if="role === 2" />
  <div v-else class="mx-auto max-w-7xl p-6"><div class="h-64 animate-pulse rounded-3xl bg-slate-200" /></div>
</template>
