<script setup lang="ts">
import { computed, provide, ref, shallowRef, watch } from "vue";
import Sidebar from "~/components/layout/Sidebar.vue";
import TopNavbar from "~/components/layout/TopNavbar.vue";
import FloatingSupport from "~/components/layout/FloatingSupport.vue";
import { useAuthStore } from "~/stores/api/auth";
import { getMenuByRole, canAccessPage } from "~/utils/roles";
import { appShellKey, type PageShellActions } from "~/composables/useAppShell";

const authStore = useAuthStore();
const route = useRoute();
const isSidebarOpen = ref(false);
const searchQuery = ref("");
const actions = shallowRef<PageShellActions>({});
provide(appShellKey, { actions, searchQuery });
const currentUser = computed(() => authStore.user || undefined);

watch(() => route.fullPath, () => { isSidebarOpen.value = false; });

function handleSearch(query: string) {
  searchQuery.value = query;
  actions.value.search?.(query);
}

async function handleNavigate(name: string) {
  const item = getMenuByRole(authStore.user?.role).find((item) => item.name === name);
  if (!item) return;
  isSidebarOpen.value = false;
  // Keep dashboard's existing modal actions until standalone pages are available.
  if (name === "home" || Number(authStore.user?.role) === 1 || item.path !== "/dashboard") {
    await navigateTo(item.path);
  } else if (actions.value.navigate) {
    actions.value.navigate(name);
  } else {
    await navigateTo({ path: "/dashboard", query: { menu: name } });
  }
}

async function openAiParser() {
  if (!canAccessPage(authStore.user?.role, 'question.ai-import')) return;
  if (actions.value.openAiParser) actions.value.openAiParser();
  else await navigateTo({ path: "/dashboard", query: { action: "import" } });
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white" @keydown.esc="isSidebarOpen = false">
    <Sidebar
      :is-open="isSidebarOpen"
      @navigate="handleNavigate"
      @close="isSidebarOpen = false"
    />
    <div class="flex min-h-screen min-w-0 flex-col lg:ml-[260px]">
      <TopNavbar
        v-model:search-query="searchQuery"
        :user="currentUser"
        @search="handleSearch"
        @open-ai-parser="openAiParser"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />
      <main class="w-full min-w-0 flex-1">
        <slot />
      </main>
    </div>
    <FloatingSupport />
  </div>
</template>
