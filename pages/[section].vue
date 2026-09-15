<script setup lang="ts">
definePageMeta({ layout: 'default' });

import { computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/api/auth';
import { getMenuByRole, ROLES } from '~/utils/roles';

const authStore = useAuthStore();
const route = useRoute();
const section = computed(() => getMenuByRole(ROLES.ADMIN).find((item) => item.path === route.path));
const isAdmin = computed(() => Number(authStore.user?.role) === ROLES.ADMIN);

onMounted(async () => {
  authStore.initializeAuth();
  if (!isAdmin.value || !section.value) await navigateTo('/dashboard');
});
</script>

<template>
  <div v-if="isAdmin && section" class="mx-auto w-full max-w-[1536px] px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10">
    <div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
      <h1 class="text-2xl font-extrabold text-slate-900">{{ section.label }}</h1>
      <p class="mt-2 text-sm font-medium text-slate-500">Dalam pengembangan</p>
    </div>
  </div>
</template>
