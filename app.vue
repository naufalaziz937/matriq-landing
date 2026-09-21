<template>
  <ClientOnly>
    <div
      v-if="!authStore.isAuthInitialized"
      class="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6"
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-col items-center gap-5 text-center">
        <img
          src="/mascot/logo-teks.svg"
          alt="MatrIQ"
          class="h-20 w-auto animate-pulse object-contain"
        >
        <div class="h-1.5 w-32 overflow-hidden rounded-full bg-blue-100">
          <div class="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
        </div>
        <p class="text-sm font-medium text-slate-500">Menyiapkan MatrIQ...</p>
      </div>
    </div>

    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>

    <template #fallback>
      <div
        class="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6"
        role="status"
        aria-label="Menyiapkan MatrIQ"
      >
        <img
          src="/mascot/logo-teks.svg"
          alt="MatrIQ"
          class="h-20 w-auto animate-pulse object-contain"
        >
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/api/auth";

const authStore = useAuthStore();
</script>
