<template>
  <header
    class="relative z-30 flex min-h-20 flex-wrap items-center gap-3 bg-[#F8FAFC]/95 px-4 py-3 backdrop-blur sm:px-6 lg:flex-nowrap lg:px-8"
    data-purpose="top-navigation"
  >
    <button
      type="button"
      class="shrink-0 rounded-xl bg-white p-2.5 text-slate-600 shadow-sm ring-1 ring-slate-200 hover:text-blue-600 lg:hidden"
      aria-label="Buka menu navigasi"
      @click="$emit('toggle-sidebar')"
    >
      <Menu class="h-5 w-5" />
    </button>

    <!-- Search Input Container -->
    <div class="relative order-3 w-full lg:order-none lg:max-w-md lg:flex-1">
      <span
        class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"
      >
        <Search class="w-4 h-4" />
      </span>
      <input
        v-model="searchQuery"
        @input="$emit('search', searchQuery)"
        class="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
        placeholder="Cari materi, soal, atau topik..."
        type="text"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Right Header Actions (AI Parser, Notification & Profile) -->
    <div class="ml-auto flex min-w-0 items-center gap-1 sm:gap-2 lg:gap-4">
      <!-- Database & AI Parser Action Badges -->
      <button
        v-if="canImport"
        @click="$emit('open-ai-parser')"
        class="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all"
        title="AI Question Parser (DOCX / PDF)"
      >
        <Sparkles class="w-3.5 h-3.5 text-amber-300" />
        <span>Import AI Soal</span>
      </button>

      <NuxtLink v-if="role === 2" to="/analytics" class="hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 md:inline-flex"><Flame class="h-3.5 w-3.5 text-orange-500" />{{ streakDays }} Hari</NuxtLink>

      <NotificationPopover />

      <!-- Profile Chip -->
      <div class="relative">
        <button
          type="button"
          @click="showProfileMenu = !showProfileMenu"
          class="flex items-center gap-3 pl-2 pr-1 cursor-pointer group select-none"
          :aria-expanded="showProfileMenu"
          aria-label="Buka menu profil"
        >
          <div
            class="w-10 h-10 rounded-full bg-sky-300 text-blue-900 font-bold flex items-center justify-center text-base shadow-sm ring-2 ring-white group-hover:ring-blue-400 transition-all overflow-hidden"
          >
            <img
              v-if="profilePhoto && !avatarLoadFailed"
              :src="profilePhoto"
              :alt="`Foto profil ${displayName}`"
              class="w-full h-full object-cover"
              @error="avatarLoadFailed = true"
            />
            <span v-else>{{ avatarInitial }}</span>
          </div>
          <div class="text-left hidden sm:block">
            <h4
              class="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors"
            >
              {{ displayName }}
            </h4>
            <p class="text-xs text-slate-400 font-medium">
              {{ profileSubtitle }}
            </p>
          </div>
          <ChevronDown
            class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform"
            :class="{ 'rotate-180': showProfileMenu }"
          />
        </button>

        <!-- Profile Menu Dropdown -->
        <div
          v-if="showProfileMenu"
          class="fixed left-4 right-4 top-20 z-50 mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl animate-in fade-in duration-150 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:w-64"
        >
          <div v-if="role === 2 && currentUser?.target" class="pb-3 border-b border-slate-100">
            <p
              class="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              Target PTN & Jurusan
            </p>
            <p class="text-sm font-bold text-slate-800 mt-0.5">
              🎯 {{ currentUser.target.pilihan?.[0]?.program || currentUser.target.program || "Target" }} - {{ currentUser.target.pilihan?.[0]?.campus || currentUser.target.campus || "PTN" }}
            </p>
            <p class="text-xs text-emerald-600 font-semibold mt-1">
              Target skor: {{ currentUser.target.target_score ?? "—" }}
            </p>
          </div>
          <div class="pt-3 space-y-1 text-xs font-semibold text-slate-600">
            <NuxtLink
              to="/profile"
              class="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <UserCircle class="w-4 h-4" /> Profil & Pengaturan
            </NuxtLink>
            <a
              href="#"
              class="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <Sparkles class="w-4 h-4 text-amber-500" /> Upgrade MatrIQ Pro
            </a>
            <button
              type="button"
              class="w-full flex items-center gap-2 p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              @click="handleLogout"
            >
              <LogOut class="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  Search,
  X,
  Flame,
  ChevronDown,
  Sparkles,
  UserCircle,
  LogOut,
  Menu,
} from "lucide-vue-next";
import { useAuthStore } from "~/stores/api/auth";
import { useUserDashboardStore } from "~/stores/api/userDashboard";
import { useNotificationsStore } from "~/stores/api/notifications";
import { canAccessPage, getRoleLabel } from "~/utils/roles";
import NotificationPopover from "~/components/layout/NotificationPopover.vue";

const props = defineProps<{
  user?: {
    name?: string;
    nama?: string;
    role?: string | number;
    class_level?: string;
    avatar_initial?: string;
    foto_profile?: string | null;
    profile?: {
      kelas?: string;
    };
  };
}>();

const authStore = useAuthStore();

const emit = defineEmits<{
  (e: "search", query: string): void;
  (e: "open-ai-parser"): void;
  (e: "toggle-sidebar"): void;
}>();

const searchQuery = defineModel<string>('searchQuery', { default: '' });
const route = useRoute();
watch(() => route.fullPath, () => {
  showProfileMenu.value = false;
});
const showProfileMenu = ref(false);
const avatarLoadFailed = ref(false);

const currentUser = computed(() => authStore.user || props.user);
const profilePhoto = computed(() => currentUser.value?.foto_profile || "");
const displayName = computed(
  () => currentUser.value?.nama || currentUser.value?.name || "Pengguna",
);
const role = computed(() => Number(authStore.user?.role));
const canImport = computed(() => canAccessPage(role.value, "question.ai-import"));
const dashboardStore = useUserDashboardStore();
const notificationsStore = useNotificationsStore();
const streakDays = computed(() => Number(dashboardStore.stats?.streak_days || 0));
const displayRole = computed(() => getRoleLabel(role.value));
const displayClass = computed(() => currentUser.value?.profile?.kelas || currentUser.value?.class_level || "");
const profileSubtitle = computed(() => role.value === 2 && displayClass.value ? `${displayRole.value} · ${displayClass.value}` : displayRole.value);
const avatarInitial = computed(
  () =>
    currentUser.value?.avatar_initial ||
    displayName.value.charAt(0).toUpperCase(),
);

function clearSearch() {
  searchQuery.value = "";
  emit("search", "");
}

async function handleLogout() {
  showProfileMenu.value = false;
  authStore.logout();
  notificationsStore.reset();
  await navigateTo("/login");
}

watch(profilePhoto, () => {
  avatarLoadFailed.value = false;
});

onMounted(async () => {
  authStore.initializeAuth();

  if (authStore.token) {
    await authStore.fetchCurrentUser();
    if (Number(authStore.user?.role) === 2 && !dashboardStore.stats) await dashboardStore.fetchUserDashboard();
  }
});
</script>
