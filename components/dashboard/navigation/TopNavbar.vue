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
        @click="$emit('open-ai-parser')"
        class="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all"
        title="AI Question Parser (DOCX / PDF)"
      >
        <Sparkles class="w-3.5 h-3.5 text-amber-300" />
        <span>Import AI Soal</span>
      </button>

      <!-- PostgreSQL Status Pill -->
      <div
        class="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
        :class="
          dbConnected
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        "
      >
        <span
          class="w-2 h-2 rounded-full"
          :class="dbConnected ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'"
        ></span>
        <span>{{
          dbConnected ? "PostgreSQL Active" : "PostgreSQL Ready"
        }}</span>
      </div>

      <!-- Notification Icon with Orange Badge -->
      <div class="relative">
        <button
          @click="showNotifications = !showNotifications"
          class="relative p-2.5 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors focus:outline-none"
        >
          <Bell class="w-6 h-6 stroke-current" />
          <span
            v-if="unreadCount > 0"
            class="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center rounded-full ring-2 ring-white animate-soft-pulse"
          >
            {{ unreadCount }}
          </span>
        </button>

        <!-- Notification Popover -->
        <div
          v-if="showNotifications"
          class="fixed left-4 right-4 top-20 z-50 mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:w-80"
        >
          <div
            class="flex items-center justify-between pb-3 border-b border-slate-100"
          >
            <h4 class="text-sm font-bold text-slate-900">Notifikasi</h4>
            <span
              class="text-[11px] font-semibold text-blue-600 cursor-pointer hover:underline"
              @click="markAllRead"
            >
              Tandai Dibaca
            </span>
          </div>

          <div class="space-y-2.5 mt-3 max-h-64 overflow-y-auto">
            <div
              v-for="notif in notifications"
              :key="notif.id"
              class="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex gap-3 items-start"
            >
              <div
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
                  notif.badgeClass,
                ]"
              >
                {{ notif.icon }}
              </div>
              <div class="text-xs">
                <p class="font-bold text-slate-800">{{ notif.title }}</p>
                <p class="text-slate-500 text-[11px] mt-0.5 leading-snug">
                  {{ notif.desc }}
                </p>
                <span class="text-[10px] text-slate-400 mt-1 block">{{
                  notif.time
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              {{ displayRole }} · {{ displayClass }}
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
          <div class="pb-3 border-b border-slate-100">
            <p
              class="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              Target PTN & Jurusan
            </p>
            <p class="text-sm font-bold text-slate-800 mt-0.5">
              🎯 Teknik Informatika - ITB
            </p>
            <p class="text-xs text-emerald-600 font-semibold mt-1">
              Passing Grade: 720+ (Target Aman)
            </p>
          </div>
          <div class="pt-3 space-y-1 text-xs font-semibold text-slate-600">
            <a
              href="#"
              class="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <UserCircle class="w-4 h-4" /> Profil & Pengaturan
            </a>
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
  Bell,
  ChevronDown,
  Sparkles,
  UserCircle,
  LogOut,
  Menu,
} from "lucide-vue-next";
import { useAuthStore } from "~/stores/api/auth";

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
  dbConnected?: boolean;
}>();

const authStore = useAuthStore();

const emit = defineEmits<{
  (e: "search", query: string): void;
  (e: "open-ai-parser"): void;
  (e: "toggle-sidebar"): void;
}>();

const searchQuery = ref("");
const showNotifications = ref(false);
const showProfileMenu = ref(false);
const unreadCount = ref(1);
const avatarLoadFailed = ref(false);

const currentUser = computed(() => authStore.user || props.user);
const profilePhoto = computed(() => currentUser.value?.foto_profile || "");
const displayName = computed(
  () => currentUser.value?.nama || currentUser.value?.name || "Pengguna",
);
const displayRole = computed(() => {
  const role = currentUser.value?.role;

  if (typeof role === "string") return role;
  if (role === 1) return "Admin";
  if (role === 3) return "Tutor";

  return "Siswa";
});
const displayClass = computed(
  () =>
    currentUser.value?.profile?.kelas ||
    currentUser.value?.class_level ||
    "Kelas 12",
);
const avatarInitial = computed(
  () =>
    currentUser.value?.avatar_initial ||
    displayName.value.charAt(0).toUpperCase(),
);

const notifications = ref([
  {
    id: 1,
    icon: "🔥",
    title: "Streak 7 Hari Tercapai!",
    desc: "Pertahankan konsistensimu belajar UTBK hari ini.",
    time: "10 menit lalu",
    badgeClass: "bg-orange-100 text-orange-600",
  },
  {
    id: 2,
    icon: "📝",
    title: "Simulasi Tryout Akbar",
    desc: "Tryout Nasional MatrIQ UTBK dibuka akhir pekan ini.",
    time: "2 jam lalu",
    badgeClass: "bg-blue-100 text-blue-600",
  },
]);

function clearSearch() {
  searchQuery.value = "";
  emit("search", "");
}

function markAllRead() {
  unreadCount.value = 0;
}

async function handleLogout() {
  showProfileMenu.value = false;
  authStore.logout();
  await navigateTo("/login");
}

watch(profilePhoto, () => {
  avatarLoadFailed.value = false;
});

onMounted(async () => {
  authStore.initializeAuth();

  if (authStore.token) {
    await authStore.fetchCurrentUser();
  }
});
</script>
