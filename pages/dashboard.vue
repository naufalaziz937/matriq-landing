<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

import { ref, computed, onMounted, watch } from "vue";
import {
  Users,
  UserCheck,
  CircleHelp,
  BookOpenText,
  UserCog,
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  ChartNoAxesCombined,
  ShieldCheck,
  Download,
  Settings,
  ChevronRight,
  ShieldUser,
  LibraryBig,
  BadgeCheck,
  ChartSpline,
} from "lucide-vue-next";
import { useAuthStore } from "~/stores/api/auth";
import { useOnboardingStore } from "~/stores/api/onboarding";
import { useUserDashboardStore } from "~/stores/api/userDashboard";
import type { DashboardData, OnboardingData } from "~/types/dashboard";
import AiParserModal from "~/components/dashboard/AiParserModal.vue";
import FeatureGrid from "~/components/dashboard/FeatureGrid.vue";
import HeroStudyCard from "~/components/dashboard/HeroStudyCard.vue";
import OverallProgress from "~/components/dashboard/OverallProgress.vue";
import RecentActivities from "~/components/dashboard/RecentActivities.vue";
import RecommendationBanner from "~/components/dashboard/RecommendationBanner.vue";
import StatSummary from "~/components/dashboard/StatSummary.vue";
import TodayTasks from "~/components/dashboard/TodayTasks.vue";
import WelcomeBanner from "~/components/dashboard/WelcomeBanner.vue";
import TutorDashboard from "~/components/dashboard/TutorDashboard.vue";
import OnboardingProfileModal from "~/components/form/OnboardingProfileModal.vue";
// import AlertModal from "~/components/ui/AlertModal.vue";

// ======================================================
// CONFIG
// ======================================================

const config = useRuntimeConfig();

const apiBase = config.public.apiBase || "http://localhost:4000/api";

const onboardingStore = useOnboardingStore();
const userDashboardStore = useUserDashboardStore();
const authStore = useAuthStore();
const isAdmin = computed(() => Number(authStore.user?.role) === 1);
const isTutor = computed(() => Number(authStore.user?.role) === 3);
const isStudent = computed(() => Number(authStore.user?.role) === 2);
const isRoleDashboardLoading = ref(false);
const isDashboardBootstrapping = computed(
  () =>
    !authStore.isAuthInitialized ||
    !authStore.isAuthenticated ||
    (isAdmin.value && isRoleDashboardLoading.value) ||
    (isStudent.value && !userDashboardStore.dashboard && !userDashboardStore.error),
);
const adminUsers = ref<any[]>([]);
const adminTotalUsers = ref<number | null>(null);
const adminActiveUsers = ref<number | null>(null);

const adminTotalQuestions = ref<number | null>(null);
const adminTotalMaterials = ref<number | null>(null);

async function fetchAdminSummary() {
  try {
    const res = await fetch(`${apiBase}/admin/users?limit=100`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    const users = Array.isArray(result.data) ? result.data : [];
    adminUsers.value = users;
    adminTotalUsers.value = Number(result.pagination?.total ?? users.length);
    // The endpoint is paginated, so a partial page cannot yield an exact active total.
    adminActiveUsers.value =
      adminTotalUsers.value <= users.length
        ? users.filter((user: any) => user.is_activate === true).length
        : null;
  } catch (error) {
    console.warn("Ringkasan admin belum tersedia:", error);
  }
  try {
    const res = await fetch(`${apiBase}/admin/questions/summary`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    adminTotalQuestions.value = Number(result.data?.total ?? 0);
  } catch (error) {
    console.warn("Ringkasan Bank Soal belum tersedia:", error);
  }
  try {
    const res = await fetch(`${apiBase}/admin/materials/summary`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    adminTotalMaterials.value = Number(result.data?.total ?? 0);
  } catch (error) {
    console.warn("Ringkasan materi belum tersedia:", error);
  }
}

// ======================================================
// STATE MODAL
// ======================================================

const showLoginAlert = ref(false);
const showOnboardingModal = ref(false);

const isSavingProfile = ref(false);
const onboardingError = ref("");

// ======================================================
// STATE DASHBOARD
// ======================================================

const dashboardData = ref<DashboardData | null>(null);

// ======================================================
// STATE LAIN
// ======================================================

const searchQuery = ref("");
const isAiParserOpen = ref(false);
const isTryoutRecapOpen = ref(false);
const toastMessage = ref("");

// ======================================================
// TOAST
// ======================================================

function showToast(msg: string) {
  toastMessage.value = msg;

  setTimeout(() => {
    toastMessage.value = "";
  }, 3500);
}

// ======================================================
// FETCH DASHBOARD
// ======================================================

function timeAgo(value: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  if (minutes < 2) return "Baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} jam lalu`;
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function mapUserDashboard(data: any) {
  const profile = data.profile || {};
  const stats = data.stats || {};
  const daily = data.daily_progress || {};
  const category = data.category_progress || {};
  const recap = data.tryout || {};
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  dashboardData.value = {
    user: {
      id: data.user.user_id,
      name: data.user.nama,
      role: "Siswa",
      class_level: profile.kelas || "",
      avatar_initial: data.user.nama?.charAt(0).toUpperCase() || "S",
      foto_profile: data.user.foto_profile || null,
    },
    stats: {
      streak_days: Number(stats.streak_days || 0),
      total_hours:
        Math.round((Number(stats.total_study_minutes || 0) / 60) * 10) / 10,
      total_questions: Number(stats.total_questions || 0),
      average_accuracy:
        stats.average_accuracy == null ? null : Number(stats.average_accuracy),
      target_questions: Number(daily.target_questions || 0),
      completed_questions: Number(daily.completed_questions || 0),
      overall_progress_pct: category.total_materials
        ? Math.round(
            (100 * category.completed_materials) / category.total_materials,
          )
        : 0,
    } as any,
    categories: [
      {
        name: "Materi",
        completed: Number(category.completed_materials || 0),
        total: Number(category.total_materials || 0),
        color: "bg-blue-600",
      },
      {
        name: "Latihan Soal",
        completed: Number(daily.completed_questions || 0),
        total: Number(daily.target_questions || 50),
        color: "bg-amber-400",
      },
      {
        name: "Rekap Tryout",
        completed: Number(recap.total_recap || 0),
        total: null,
        color: "bg-teal-500",
      },
    ] as any,
    tasks: (data.study_progress || [])
      .filter(
        (row: any) =>
          new Date(row.created_at).toLocaleDateString("en-CA", {
            timeZone: "Asia/Jakarta",
          }) === today,
      )
      .map((row: any) => ({
        id: row.progress_id,
        title: row.materi || "Latihan Soal",
        questions_count: row.soal_dikerjakan,
        accuracy_pct: row.soal_dikerjakan
          ? Math.round((100 * row.soal_benar) / row.soal_dikerjakan)
          : 0,
        is_completed: true,
        icon_symbol: "📚",
        bg_color: "bg-blue-100",
        text_color: "text-blue-700",
      })),
    activities: (data.recent_activities || []).map((row: any) => ({
      id: `${row.kind}-${row.id}`,
      title:
        row.kind === "tryout"
          ? "Menambahkan Rekap Tryout"
          : `Mengerjakan ${row.questions || 0} soal${row.title ? ` · ${row.title}` : ""}`,
      subtitle:
        row.kind === "tryout"
          ? `Skor ${row.score} · ${row.platform || "Platform eksternal"}`
          : `${row.accuracy ?? "—"}% Akurasi`,
      time_ago: timeAgo(row.occurred_at),
      badge_type: row.kind === "tryout" ? "success" : "time",
      icon_type: row.kind === "tryout" ? "tryout" : "math",
      color: row.kind === "tryout" ? "amber" : "blue",
    })) as any,
    recommendation: data.recommendations?.[0] || {},
    dbStatus: { isConnected: true, provider: "MatrIQ API" },
  };
}

async function fetchDashboard() {
  const data = await userDashboardStore.fetchUserDashboard();
  if (data) mapUserDashboard(data);
}

// ======================================================
// LOGIN -> ALERT -> ONBOARDING
// ======================================================

function maybeShowOnboarding() {
  if (!import.meta.client) return;

  const user = authStore.user;

  // Kalau user object belum punya is_activate,
  // anggap onboarding BELUM selesai.
  const isActivated = user?.is_activate === true;

  showOnboardingModal.value = !isActivated;
}

function handleLoginAlertDone() {
  showLoginAlert.value = false;

  maybeShowOnboarding();
}

// ======================================================
// ONBOARDING SUBMIT
// ======================================================

async function handleOnboardingSubmit(data: OnboardingData) {
  onboardingError.value = "";

  const token = authStore.token;

  if (!token) {
    await navigateTo("/login");
    return;
  }

  isSavingProfile.value = true;

  try {
    const formData = new FormData();

    formData.append("no_hp", data.no_hp);

    formData.append("gender", data.gender);

    formData.append("sekolah", data.sekolah);

    formData.append("kelas", data.kelas);

    formData.append("tahun_lulus", String(data.tahun_lulus));

    formData.append("provinsi", data.provinsi);

    formData.append("kota_kab", data.kota_kab);

    formData.append("pilihan", String(data.pilihan));

    formData.append("target_score", String(data.target_score));

    // FOTO PROFILE OPTIONAL
    if (data.foto_profile) {
      formData.append("foto_profile", data.foto_profile);
    }

    const result = await authStore.completeOnboarding(formData);

    if (!result.success || !result.data) {
      throw new Error(result.message || "Gagal menyimpan profil");
    }

    showOnboardingModal.value = false;

    showToast("Profil berhasil dilengkapi! 🎉");

    await fetchDashboard();
  } catch (error: any) {
    console.error("ONBOARDING ERROR:", error);

    onboardingError.value =
      error?.data?.message ||
      error?.message ||
      "Gagal menyimpan profil. Silakan coba lagi.";
  } finally {
    isSavingProfile.value = false;
  }
}

// ======================================================
// SKIP ONBOARDING
// ======================================================

function handleSkipOnboarding() {
  showOnboardingModal.value = false;
}

// ======================================================
// ON MOUNTED
// ======================================================

onMounted(async () => {
  handleLayoutQuery();

  if (!authStore.isAuthenticated) {
    await navigateTo("/login");
    return;
  }

  const user = authStore.user;

  if (Number(user.role) === 1) {
    isRoleDashboardLoading.value = true;
    try {
      await fetchAdminSummary();
    } finally {
      isRoleDashboardLoading.value = false;
    }
    return;
  }
  if (Number(user.role) === 3) return;

  if (user.is_activate !== true) {
    await Promise.allSettled([
      onboardingStore.fetchProvinces(),
      onboardingStore.fetchKampus(),
    ]);
  }

  await fetchDashboard();

  localStorage.removeItem("justLoggedIn");
  maybeShowOnboarding();
});

// Kalau AlertModal ditutup lewat v-model, tombol confirm,
// tombol X, atau cara lain, tetap lanjut cek onboarding.
watch(showLoginAlert, (isOpen, wasOpen) => {
  if (wasOpen === true && isOpen === false) {
    maybeShowOnboarding();
  }
});

// ======================================================
// SEARCH
// ======================================================

const filteredTasks = computed(() => {
  const tasks = dashboardData.value?.tasks || [];
  if (!searchQuery.value) {
    return tasks;
  }

  const q = searchQuery.value.toLowerCase();

  return tasks.filter((t: any) =>
    t.title.toLowerCase().includes(q),
  );
});
const targetSummary = computed(() => {
  const target = userDashboardStore.target;
  if (!target?.campus && !target?.program)
    return "Belum ada target PTN. Lengkapi target belajarmu.";
  return `Target utama: ${[target.campus, target.program].filter(Boolean).join(" · ")}${target.target_score != null ? ` · target skor ${target.target_score}` : ""}`;
});

function handleSearch(query: string) {
  searchQuery.value = query;
}

// ======================================================
// TASK TOGGLE
// ======================================================

// ======================================================
// FEATURE NAVIGATION
// ======================================================

function handleFeatureSelect(featureId: string) {
  if (featureId === "latihan-soal" || featureId === "materi-pembahasan") {
    navigateTo("/practice");
  } else if (featureId === "tryout") {
    isTryoutRecapOpen.value = true;
  } else if (featureId === "roadmap-belajar") {
    showToast("Lihat progres belajarmu di dashboard.");
  }
}

// ======================================================
// SIDEBAR NAVIGATION
// ======================================================

function handleNavigation(navName: string) {
  if (navName === "practice") {
    navigateTo("/practice");
  } else if (navName === "tryout") {
    isTryoutRecapOpen.value = true;
  } else {
    showToast(`Navigasi ke menu ${navName.toUpperCase()}`);
  }
}

// ======================================================
// PRACTICE COMPLETED
// ======================================================

// ======================================================
// AI PARSER
// ======================================================

function handleAiQuestionsSaved() {
  showToast("Dokumen selesai diproses.");
  fetchDashboard();
}
useAppShell({
  search: handleSearch,
  openAiParser: () => {
    isAiParserOpen.value = true;
  },
  navigate: handleNavigation,
  get dbConnected() {
    return dashboardData.value?.dbStatus?.isConnected;
  },
});
const route = useRoute();
function handleLayoutQuery() {
  if (route.query.action === "import" && (isAdmin.value || isTutor.value))
    isAiParserOpen.value = true;
  if (typeof route.query.menu === "string") handleNavigation(route.query.menu);
}
watch(() => route.query, handleLayoutQuery);

// ======================================================
// ADMIN DASHBOARD
// ======================================================

const adminGreetingName = computed(
  () => authStore.user?.nama?.split(" ")[0] || authStore.user?.name?.split(" ")[0] || "Admin",
);

// Maskot dipilih dari asset 16.svg yang user upload (pose thumbs-up).
// Dibuat data URI supaya dashboard.vue bisa langsung dipakai tanpa file asset tambahan.
const adminMascotSrc = "/mascot/duduk-nobg.svg";

const adminStatCards = computed(() => [
  {
    label: "Total Users",
    value: adminTotalUsers.value,
    helper: "Seluruh akun MatrIQ",
    icon: Users,
    bg: "bg-pale-blue",
    text: "text-primary-container",
  },
  {
    label: "Active Users",
    value: adminActiveUsers.value,
    helper: "Onboarding telah selesai",
    icon: UserCheck,
    bg: "bg-success-soft",
    text: "text-success-emerald",
  },
  {
    label: "Total Questions",
    value: adminTotalQuestions.value,
    helper: "Bank soal MatrIQ",
    icon: CircleHelp,
    bg: "bg-soft-orange",
    text: "text-on-secondary-container",
  },
  {
    label: "Total Materials",
    value: adminTotalMaterials.value,
    helper: "Materi & pembahasan",
    icon: BookOpenText,
    bg: "bg-accent-purple-soft",
    text: "text-accent-purple",
  },
]);

const adminManagementMenus = [
  {
    label: "User Management",
    description: "Kelola akun, role, dan status user.",
    path: "/users",
    icon: UserCog,
    bg: "bg-pale-blue",
    text: "text-primary-container",
  },
  {
    label: "Bank Soal",
    description: "Kelola soal, kategori, subtes, dan pembahasan.",
    path: "/question-bank",
    icon: CircleHelp,
    bg: "bg-soft-orange",
    text: "text-on-secondary-container",
  },
  {
    label: "Materi",
    description: "Kelola materi belajar dan pembahasan.",
    path: "/materials",
    icon: BookOpenText,
    bg: "bg-accent-purple-soft",
    text: "text-accent-purple",
  },
  {
    label: "Kampus & Prodi",
    description: "Kelola master data kampus dan program studi.",
    path: "/campuses",
    icon: GraduationCap,
    bg: "bg-success-soft",
    text: "text-success-emerald",
  },
];

const adminMonitoringMenus = [
  {
    label: "Rekap Tryout",
    description: "Pantau hasil tryout eksternal yang dicatat siswa.",
    path: "/tryout-recap",
    icon: ClipboardCheck,
    bg: "bg-pale-blue",
    text: "text-primary-container",
  },
  {
    label: "Progress Siswa",
    description: "Lihat perkembangan belajar siswa secara agregat.",
    path: "/student-progress",
    icon: TrendingUp,
    bg: "bg-success-soft",
    text: "text-success-emerald",
  },
  {
    label: "Analytics",
    description: "Analisis user, aktivitas, skor, dan engagement.",
    path: "/analytics",
    icon: ChartNoAxesCombined,
    bg: "bg-soft-orange",
    text: "text-on-secondary-container",
  },
];

const adminSystemMenus = [
  {
    label: "Content Moderation",
    description: "Review materi dan soal yang dikirim tutor.",
    path: "/moderation",
    icon: ShieldCheck,
    bg: "bg-accent-purple-soft",
    text: "text-accent-purple",
  },
  {
    label: "Reports / Export",
    description: "Export data user, rekap, progress, dan statistik.",
    path: "/reports",
    icon: Download,
    bg: "bg-pale-blue",
    text: "text-primary-container",
  },
  {
    label: "Settings",
    description: "Atur konfigurasi global MatrIQ.",
    path: "/settings",
    icon: Settings,
    bg: "bg-soft-orange",
    text: "text-on-secondary-container",
  },
];

const adminRecentUsers = computed(() => adminUsers.value.slice(0, 5));

const adminActivePercentage = computed(() => {
  if (!adminTotalUsers.value || adminActiveUsers.value == null) return null;
  return Math.round((adminActiveUsers.value / adminTotalUsers.value) * 100);
});

function adminUserInitial(user: any) {
  return (user.nama ?? user.name ?? user.email ?? "U").charAt(0).toUpperCase();
}

function adminRoleLabel(role: number | string) {
  const value = Number(role);
  if (value === 1) return "Admin";
  if (value === 3) return "Tutor";
  return "Siswa";
}
</script>

<template>
  <ClientOnly>
    <div>
    <div
      v-if="isDashboardBootstrapping"
      class="mx-auto grid w-full max-w-[1536px] grid-cols-12 gap-4 px-4 pb-8 pt-2 sm:gap-6 sm:px-6 lg:gap-7 lg:px-8 lg:pb-10"
      aria-label="Memuat dashboard"
    >
      <div class="col-span-12 h-44 animate-pulse rounded-3xl bg-slate-200" />
      <div class="col-span-12 h-64 animate-pulse rounded-3xl bg-slate-200 xl:col-span-8" />
      <div class="col-span-12 h-64 animate-pulse rounded-3xl bg-slate-200 xl:col-span-4" />
    </div>

    <template v-else>
    <div
      v-if="isAdmin"
      class="mx-auto flex w-full max-w-[1536px] flex-1 flex-col gap-6 px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10"
    >
      <!-- Admin Hero: mengikuti bahasa visual dashboard siswa -->
      <section
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-container to-deep-blue px-6 py-7 shadow-sm sm:px-8 sm:py-8"
      >
        <div
          class="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        ></div>
        <div
          class="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-bright-orange/10 blur-xl"
        ></div>

        <div
          class="relative flex min-h-[150px] items-center justify-between gap-4"
        >
          <div class="max-w-2xl">
            <span
              class="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-caption text-caption font-bold text-white backdrop-blur-sm"
            >
              <ShieldUser class="h-[15px] w-[15px]" :stroke-width="2.2" />
              Admin MatrIQ
            </span>

            <h1 class="font-headline-md text-headline-md text-white">
              Halo, {{ adminGreetingName }}! 👋
            </h1>

            <p
              class="mt-2 max-w-xl font-body-sm text-body-sm leading-relaxed text-white/80"
            >
              Pantau aktivitas platform, kelola konten, dan lihat perkembangan
              belajar siswa dari satu tempat.
            </p>
          </div>

          <div
            class="relative hidden h-[150px] w-[150px] shrink-0 items-end justify-center sm:flex lg:h-[170px] lg:w-[170px]"
          >
            <div
              class="absolute inset-x-4 bottom-1 h-8 rounded-full bg-black/10 blur-lg"
            ></div>
            <img
              :src="adminMascotSrc"
              alt="Mascot MatrIQ admin"
              class="relative z-10 max-h-[150px] w-auto object-contain drop-shadow-lg lg:max-h-[168px]"
            />
          </div>
        </div>
      </section>

      <!-- Summary -->
      <section
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Ringkasan admin"
      >
        <article
          v-for="metric in adminStatCards"
          :key="metric.label"
          class="rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              :class="metric.bg"
            >
              <component
                :is="metric.icon"
                class="h-[22px] w-[22px]"
                :class="metric.text"
                :stroke-width="2.1"
              />
            </div>

            <span
              class="rounded-full bg-surface-container px-2.5 py-1 font-caption text-caption font-semibold text-outline"
            >
              Live
            </span>
          </div>

          <div class="mt-5">
            <p
              class="font-caption text-caption font-bold uppercase tracking-wider text-outline"
            >
              {{ metric.label }}
            </p>
            <p class="mt-1 font-headline-sm text-headline-sm text-deep-blue">
              {{ metric.value ?? "—" }}
            </p>
            <p class="mt-1 font-caption text-caption text-outline">
              {{ metric.helper }}
            </p>
          </div>
        </article>
      </section>

      <div class="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-7">
        <!-- Main -->
        <section
          class="col-span-12 flex flex-col gap-4 sm:gap-6 xl:col-span-8"
          data-purpose="admin-primary-column"
        >
          <!-- Management -->
          <div
            class="rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm sm:p-6"
          >
            <div class="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 class="font-title-md text-title-md text-deep-blue">
                  Management
                </h2>
                <p class="mt-1 font-caption text-caption text-outline">
                  Akses utama untuk mengelola data dan konten MatrIQ.
                </p>
              </div>
              <ShieldUser
                class="h-9 w-9 rounded-xl bg-pale-blue p-2 text-primary-container"
                :stroke-width="2"
              />
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NuxtLink
                v-for="item in adminManagementMenus"
                :key="item.path"
                :to="item.path"
                class="group flex items-start gap-3 rounded-2xl border border-soft-blue p-4 transition-colors hover:bg-surface-container"
              >
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  :class="item.bg"
                >
                  <component
                    :is="item.icon"
                    class="h-5 w-5"
                    :class="item.text"
                    :stroke-width="2"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <h3
                    class="font-label-md text-label-md text-deep-blue group-hover:text-primary-container"
                  >
                    {{ item.label }}
                  </h3>
                  <p
                    class="mt-1 line-clamp-2 font-caption text-caption leading-relaxed text-outline"
                  >
                    {{ item.description }}
                  </p>
                </div>

                <ChevronRight
                  class="mt-2 h-[18px] w-[18px] text-outline transition-transform group-hover:translate-x-0.5"
                  :stroke-width="2"
                />
              </NuxtLink>
            </div>
          </div>

          <!-- Monitoring -->
          <div
            class="rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm sm:p-6"
          >
            <div class="mb-5">
              <h2 class="font-title-md text-title-md text-deep-blue">
                Monitoring & Analytics
              </h2>
              <p class="mt-1 font-caption text-caption text-outline">
                Pantau perkembangan siswa dan performa platform.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              <NuxtLink
                v-for="item in adminMonitoringMenus"
                :key="item.path"
                :to="item.path"
                class="group rounded-2xl border border-soft-blue p-4 transition-colors hover:bg-surface-container"
              >
                <div
                  class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  :class="item.bg"
                >
                  <component
                    :is="item.icon"
                    class="h-5 w-5"
                    :class="item.text"
                    :stroke-width="2"
                  />
                </div>
                <h3
                  class="font-label-md text-label-md text-deep-blue group-hover:text-primary-container"
                >
                  {{ item.label }}
                </h3>
                <p
                  class="mt-1 font-caption text-caption leading-relaxed text-outline"
                >
                  {{ item.description }}
                </p>
              </NuxtLink>
            </div>
          </div>

          <!-- System -->
          <div
            class="rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm sm:p-6"
          >
            <div class="mb-5">
              <h2 class="font-title-md text-title-md text-deep-blue">
                Moderation & System
              </h2>
              <p class="mt-1 font-caption text-caption text-outline">
                Review konten, export laporan, dan konfigurasi platform.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <NuxtLink
                v-for="item in adminSystemMenus"
                :key="item.path"
                :to="item.path"
                class="group flex items-center gap-3 rounded-2xl border border-soft-blue p-4 transition-colors hover:bg-surface-container"
              >
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  :class="item.bg"
                >
                  <component
                    :is="item.icon"
                    class="h-5 w-5"
                    :class="item.text"
                    :stroke-width="2"
                  />
                </div>
                <div class="min-w-0">
                  <h3
                    class="truncate font-label-sm text-label-sm text-deep-blue group-hover:text-primary-container"
                  >
                    {{ item.label }}
                  </h3>
                  <p
                    class="mt-0.5 line-clamp-1 font-caption text-caption text-outline"
                  >
                    {{ item.description }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </section>

        <!-- Aside -->
        <aside
          class="col-span-12 flex flex-col gap-4 sm:gap-6 xl:col-span-4"
          data-purpose="admin-secondary-column"
        >
          <!-- Recent users -->
          <div
            class="rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm sm:p-6"
          >
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 class="font-title-md text-title-md text-deep-blue">
                  User Terbaru
                </h2>
                <p class="mt-1 font-caption text-caption text-outline">
                  Akun terbaru di MatrIQ.
                </p>
              </div>
              <NuxtLink
                to="/users"
                class="font-caption text-caption font-bold text-primary-container hover:underline"
              >
                Lihat Semua
              </NuxtLink>
            </div>

            <div
              v-if="!adminRecentUsers.length"
              class="flex flex-col items-center justify-center gap-2 py-7 text-center"
            >
              <img
                :src="adminMascotSrc"
                alt="Mascot MatrIQ"
                class="h-20 w-auto object-contain opacity-90"
              />
              <p class="font-body-sm text-body-sm text-outline">
                Belum ada data user yang bisa ditampilkan.
              </p>
            </div>

            <div v-else class="space-y-1.5">
              <div
                v-for="user in adminRecentUsers"
                :key="user.user_id ?? user.id"
                class="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-pale-blue"
              >
                <img
                  v-if="user.foto_profile"
                  :src="user.foto_profile"
                  :alt="user.nama ?? user.email"
                  class="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div
                  v-else
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pale-blue font-label-sm text-label-sm font-bold text-primary-container"
                >
                  {{ adminUserInitial(user) }}
                </div>

                <div class="min-w-0 flex-1">
                  <h3
                    class="truncate font-label-sm text-label-sm text-deep-blue"
                  >
                    {{ user.nama ?? user.name ?? "User MatrIQ" }}
                  </h3>
                  <p class="truncate font-caption text-caption text-outline">
                    {{ user.email }}
                  </p>
                </div>

                <span
                  class="shrink-0 rounded-full px-2.5 py-1 font-caption text-caption font-bold"
                  :class="
                    Number(user.role) === 1
                      ? 'bg-accent-purple-soft text-accent-purple'
                      : Number(user.role) === 3
                        ? 'bg-soft-orange text-on-secondary-container'
                        : 'bg-pale-blue text-primary-container'
                  "
                >
                  {{ adminRoleLabel(user.role) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Account health -->
          <div
            class="rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm sm:p-6"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p
                  class="font-caption text-caption font-bold uppercase tracking-wider text-outline"
                >
                  Account Health
                </p>
                <h2 class="mt-1 font-title-md text-title-md text-deep-blue">
                  Aktivasi User
                </h2>
              </div>
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft"
              >
                <BadgeCheck
                  class="h-5 w-5 text-success-emerald"
                  :stroke-width="2"
                />
              </div>
            </div>

            <div class="mt-5">
              <div class="mb-2 flex items-end justify-between gap-2">
                <span class="font-headline-sm text-headline-sm text-deep-blue">
                  {{ adminActivePercentage ?? "—"
                  }}{{ adminActivePercentage !== null ? "%" : "" }}
                </span>
                <span class="font-caption text-caption text-outline">
                  {{ adminActiveUsers ?? "—" }} /
                  {{ adminTotalUsers ?? "—" }} aktif
                </span>
              </div>

              <div
                class="h-2 overflow-hidden rounded-full bg-surface-container"
              >
                <div
                  class="h-full rounded-full bg-success-emerald transition-all duration-300"
                  :style="{
                    width: `${Math.min(Math.max(adminActivePercentage ?? 0, 0), 100)}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Info recap -->
          <div
            class="rounded-3xl border border-soft-blue bg-gradient-to-br from-pale-blue to-surface-container p-5 shadow-sm"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-white"
              >
                <ChartSpline
                  class="h-5 w-5 text-primary-container"
                  :stroke-width="2"
                />
              </div>
              <div>
                <h3 class="font-label-md text-label-md text-deep-blue">
                  Rekap Tryout
                </h3>
                <p
                  class="mt-1 font-caption text-caption leading-relaxed text-outline"
                >
                  MatrIQ tidak menyelenggarakan tryout. Data di sini merupakan
                  rekap hasil tryout eksternal yang dicatat siswa untuk memantau
                  perkembangan skor mereka.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
    <TutorDashboard v-else-if="isTutor" />
    <div
      v-else
      class="mx-auto grid w-full max-w-[1536px] flex-1 grid-cols-12 gap-4 px-4 pb-8 pt-2 sm:gap-6 sm:px-6 lg:gap-7 lg:px-8 lg:pb-10"
    >
      <template v-if="userDashboardStore.error">
        <div
        role="alert"
        class="col-span-12 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-200 bg-white p-4 text-sm text-rose-700"
      >
        <span>{{ userDashboardStore.error }}</span
        ><button
          class="rounded-xl border border-rose-200 px-3 py-1.5"
          @click="fetchDashboard()"
        >
          Coba Lagi
        </button>
      </div>
      </template>
      <template v-else>
      <section
        class="col-span-12 flex flex-col gap-4 sm:gap-6 xl:col-span-8"
        data-purpose="primary-content-column"
      >
        <div
          v-if="userDashboardStore.isLoading"
          class="h-24 animate-pulse rounded-3xl bg-slate-200"
          aria-label="Memuat identitas"
        />
        <WelcomeBanner v-else :name="dashboardData.user?.name" />

        <div
          v-if="userDashboardStore.isLoading"
          class="h-64 animate-pulse rounded-3xl bg-slate-200"
          aria-label="Memuat target belajar"
        />
        <HeroStudyCard
          v-else
          :completed-count="dashboardData.stats?.completed_questions"
          :target-count="dashboardData.stats?.target_questions"
          :subtext="targetSummary"
          @start-practice="navigateTo('/practice')"
        />

        <FeatureGrid @select-feature="handleFeatureSelect" />

        <RecommendationBanner
          v-if="userDashboardStore.recommendations.length"
          :recommendation="dashboardData.recommendation"
          @open-recommendation="isTryoutRecapOpen = true"
        />
      </section>

      <aside
        class="col-span-12 flex flex-col gap-4 sm:gap-6 xl:col-span-4"
        data-purpose="secondary-insight-column"
      >
        <div
          v-if="userDashboardStore.isLoading"
          class="h-28 animate-pulse rounded-3xl bg-slate-200"
          aria-label="Memuat statistik"
        />
        <StatSummary
          v-else
          :streak-days="dashboardData.stats?.streak_days"
          :total-hours="dashboardData.stats?.total_hours"
          :total-questions="dashboardData.stats?.total_questions"
          :accuracy="dashboardData.stats?.average_accuracy"
        />

        <div
          v-if="userDashboardStore.isLoading"
          class="h-52 animate-pulse rounded-3xl bg-slate-200"
          aria-label="Memuat progres"
        />
        <OverallProgress
          v-else
          :percentage="dashboardData.stats?.overall_progress_pct"
          :categories="dashboardData.categories"
          :tryout-summary="userDashboardStore.dashboard?.tryout"
          :show-view-all="false"
        />

        <TodayTasks :tasks="filteredTasks" read-only />

        <div
          v-if="userDashboardStore.isLoading"
          class="h-44 animate-pulse rounded-3xl bg-slate-200"
          aria-label="Memuat aktivitas"
        />
        <RecentActivities
          v-else
          :activities="dashboardData.activities"
          :show-view-all="false"
        />
      </aside>
      </template>
    </div>

    </template>

    <div
      v-if="isTryoutRecapOpen && Number(authStore.user?.role) === 2"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="isTryoutRecapOpen = false"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rekap Tryout"
        class="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900">Rekap Tryout</h2>
          <button
            class="text-sm text-blue-600"
            @click="isTryoutRecapOpen = false"
          >
            Tutup
          </button>
        </div>
        <p
          v-if="!userDashboardStore.dashboard?.tryout?.total_recap"
          class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500"
        >
          Belum ada rekap tryout. Tambahkan hasil tryout pertamamu untuk mulai
          melihat perkembangan skor.
        </p>
        <template v-else
          ><div class="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div
              v-for="item in [
                {
                  label: 'Terakhir',
                  value: userDashboardStore.dashboard.tryout.latest_score,
                },
                {
                  label: 'Terbaik',
                  value: userDashboardStore.dashboard.tryout.best_score,
                },
                {
                  label: 'Rata-rata',
                  value: userDashboardStore.dashboard.tryout.average_score,
                },
              ]"
              :key="item.label"
              class="rounded-2xl bg-blue-50 p-3"
            >
              <span class="block text-slate-500">{{ item.label }}</span
              ><strong class="mt-1 block text-blue-700">{{
                item.value
              }}</strong>
            </div>
          </div>
          <div class="max-h-52 space-y-2 overflow-y-auto">
            <div
              v-for="item in userDashboardStore.tryoutTrend"
              :key="item.recap_id"
              class="flex justify-between rounded-xl border border-slate-100 p-2 text-sm"
            >
              <span
                >{{ item.tryout_name || item.platform || "Tryout eksternal" }} ·
                {{ new Date(item.recap_at).toLocaleDateString("id-ID") }}</span
              ><strong>{{ item.total_score }}</strong>
            </div>
          </div></template
        >
      </div>
    </div>

    <AiParserModal
      v-if="isAdmin || isTutor"
      :is-open="isAiParserOpen"
      @close="isAiParserOpen = false"
      @saved="handleAiQuestionsSaved"
    />

    <div
      v-if="toastMessage"
      class="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md"
    >
      <span class="text-amber-400">✦</span>
      <span class="text-xs font-semibold">{{ toastMessage }}</span>
    </div>

    <!-- 1) Alert sukses login muncul lebih dulu
    <AlertModal
      v-model="showLoginAlert"
      type="success"
      title="Login Berhasil! 🎉"
      message="Selamat datang kembali di MatrIQ. Yuk lanjutkan perjalanan belajarmu!"
      confirm-text="Lanjutkan"
      @confirm="handleLoginAlertDone"
    /> -->

    <OnboardingProfileModal
      v-if="showOnboardingModal"
      :loading="isSavingProfile"
      @submit="handleOnboardingSubmit"
      @skip="handleSkipOnboarding"
    />
    </div>

    <template #fallback>
      <div class="min-h-screen" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>
