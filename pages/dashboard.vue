<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "~/stores/api/auth";
import { useOnboardingStore } from "~/stores/api/onboarding";
import { createDefaultDashboardData } from "~/data/dashboard";
import type { DashboardData, OnboardingData } from "~/types/dashboard";
import AiParserModal from "~/components/dashboard/AiParserModal.vue";
import FeatureGrid from "~/components/dashboard/FeatureGrid.vue";
import HeroStudyCard from "~/components/dashboard/HeroStudyCard.vue";
import OverallProgress from "~/components/dashboard/OverallProgress.vue";
import PracticeModal from "~/components/dashboard/PracticeModal.vue";
import RecentActivities from "~/components/dashboard/RecentActivities.vue";
import RecommendationBanner from "~/components/dashboard/RecommendationBanner.vue";
import StatSummary from "~/components/dashboard/StatSummary.vue";
import TodayTasks from "~/components/dashboard/TodayTasks.vue";
import WelcomeBanner from "~/components/dashboard/WelcomeBanner.vue";
import Sidebar from "~/components/dashboard/navigation/Sidebar.vue";
import TopNavbar from "~/components/dashboard/navigation/TopNavbar.vue";
import OnboardingProfileModal from "~/components/form/OnboardingProfileModal.vue";
// import AlertModal from "~/components/ui/AlertModal.vue";

// ======================================================
// CONFIG
// ======================================================

const config = useRuntimeConfig();

const apiBase = config.public.apiBase || "http://localhost:4000/api";

const onboardingStore = useOnboardingStore();
const authStore = useAuthStore();

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

const dashboardData = ref<DashboardData>(createDefaultDashboardData());

// ======================================================
// STATE LAIN
// ======================================================

const searchQuery = ref("");
const isSidebarOpen = ref(false);
const isPracticeOpen = ref(false);
const isAiParserOpen = ref(false);
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

async function fetchDashboard() {
  try {
    const token = authStore.token;

    const res = await fetch(`${apiBase}/dashboard`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    if (!res.ok) {
      console.warn("Dashboard API belum tersedia / gagal:", res.status);

      return;
    }

    const response = await res.json();
    const data = response?.data ?? response;

    dashboardData.value = {
      ...dashboardData.value,
      ...data,
      user: { ...dashboardData.value.user, ...data?.user },
      stats: { ...dashboardData.value.stats, ...data?.stats },
      dbStatus: { ...dashboardData.value.dbStatus, ...data?.dbStatus },
    };
  } catch (err) {
    console.warn("Using local fallback state:", err);
  }
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

  console.log("[ONBOARDING CHECK]", {
    user,
    is_activate: user?.is_activate,
    isActivated,
  });

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

    const user = result.data;
    dashboardData.value.user = {
      ...dashboardData.value.user,
      id: user.user_id ?? user.id,
      name: user.nama ?? user.name ?? dashboardData.value.user.name,
      role: user.role === 1 ? "Admin" : user.role === 3 ? "Tutor" : "Siswa",
      class_level: user.profile?.kelas ?? dashboardData.value.user.class_level,
      avatar_initial: (user.nama ?? user.name ?? "U").charAt(0).toUpperCase(),
      foto_profile: user.foto_profile ?? null,
    };

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
  authStore.initializeAuth();

  const user = authStore.user;
  const token = authStore.token;

  console.log("[DASHBOARD MOUNT]", {
    hasUser: !!user,
    hasToken: !!token,
    user,
  });

  if (!user || !token) {
    await navigateTo("/login");
    return;
  }

  // Set user dashboard dari localStorage dulu
  dashboardData.value.user = {
    ...dashboardData.value.user,
    id: user.user_id ?? user.id,
    name: user.nama ?? user.name ?? dashboardData.value.user.name,
    role: user.role === 1 ? "Admin" : user.role === 3 ? "Tutor" : "Siswa",
    class_level: user.profile?.kelas ?? dashboardData.value.user.class_level,
    avatar_initial: (user.nama ?? user.name ?? "U").charAt(0).toUpperCase(),
    foto_profile: user.foto_profile ?? null,
  };

  // MASTER DATA WAJIB DIFETCH DARI STORE SAAT DASHBOARD MOUNT.
  // Jadi fetch tidak bergantung pada modal sudah tampil.
  const masterResults = await Promise.allSettled([
    onboardingStore.fetchProvinces(),
    onboardingStore.fetchKampus(),
  ]);

  console.log("[MASTER DATA RESULT]", {
    provinces: onboardingStore.provinces,
    kampus: onboardingStore.kampus,
    results: masterResults,
  });

  await fetchDashboard();

  const justLoggedIn = localStorage.getItem("justLoggedIn");

  if (justLoggedIn) {
    localStorage.removeItem("justLoggedIn");
    showLoginAlert.value = true;
  } else {
    maybeShowOnboarding();
  }
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
  if (!searchQuery.value) {
    return dashboardData.value.tasks;
  }

  const q = searchQuery.value.toLowerCase();

  return dashboardData.value.tasks.filter((t: any) =>
    t.title.toLowerCase().includes(q),
  );
});

function handleSearch(query: string) {
  searchQuery.value = query;
}

// ======================================================
// TASK TOGGLE
// ======================================================

async function handleToggleTask(id: number) {
  const task = dashboardData.value.tasks.find((t: any) => t.id === id);

  if (task) {
    task.is_completed = !task.is_completed;

    const completedTasks = dashboardData.value.tasks.filter(
      (t: any) => t.is_completed,
    ).length;

    dashboardData.value.stats.completed_questions = 30 + completedTasks * 5;

    showToast(
      task.is_completed
        ? `Tugas "${task.title}" berhasil diselesaikan! 🚀`
        : `Tugas "${task.title}" dibuka kembali.`,
    );
  }

  try {
    const token = authStore.token;

    const res = await fetch(`${apiBase}/tasks/${id}/toggle`, {
      method: "PATCH",

      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    if (res.ok) {
      const updated = await res.json();

      if (task) {
        task.is_completed = updated.is_completed;
      }
    }
  } catch (e) {
    console.error("Error toggling task:", e);
  }
}

// ======================================================
// ADD TASK
// ======================================================

async function handleAddTask(taskData: any) {
  try {
    const token = authStore.token;

    const res = await fetch(`${apiBase}/tasks`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify(taskData),
    });

    if (res.ok) {
      const created = await res.json();

      dashboardData.value.tasks.push(created);

      showToast("Target belajar harian berhasil ditambahkan!");
    }
  } catch (e) {
    const id = dashboardData.value.tasks.length + 1;

    dashboardData.value.tasks.push({
      id,
      ...taskData,
      is_completed: false,
    });

    showToast("Target belajar harian berhasil ditambahkan!");
  }
}

// ======================================================
// FEATURE NAVIGATION
// ======================================================

function handleFeatureSelect(featureId: string) {
  if (featureId === "latihan-soal" || featureId === "materi-pembahasan") {
    isPracticeOpen.value = true;
  } else if (featureId === "tryout") {
    showToast("🏆 Membuka Simulasi UTBK 2026 - Waktu pengerjaan: 105 menit.");

    isPracticeOpen.value = true;
  } else if (featureId === "roadmap-belajar") {
    showToast(
      "🗺️ Roadmap Belajar UTBK: Kamu berada di Level 3 (Fase Pemantapan Soal).",
    );
  }
}

// ======================================================
// SIDEBAR NAVIGATION
// ======================================================

function handleNavigation(navName: string) {
  if (navName === "practice" || navName === "tryout") {
    isPracticeOpen.value = true;
  } else {
    showToast(`Navigasi ke menu ${navName.toUpperCase()}`);
  }
}

// ======================================================
// PRACTICE COMPLETED
// ======================================================

async function handlePracticeCompleted(accuracy: number) {
  showToast(`Hebat! Kamu menyelesaikan latihan dengan skor ${accuracy}%. 🎉`);

  dashboardData.value.stats.completed_questions = Math.min(
    dashboardData.value.stats.target_questions,
    dashboardData.value.stats.completed_questions + 1,
  );

  const newActivity = {
    title: "Latihan Penalaran Matematika Baru",

    subtitle: `1 Soal Selesai · ${accuracy}% Akurasi`,

    badge_type: "time",

    icon_type: "math",

    color: "blue",
  };

  try {
    const token = authStore.token;

    const res = await fetch(`${apiBase}/activities`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify(newActivity),
    });

    if (res.ok) {
      const saved = await res.json();

      dashboardData.value.activities.unshift(saved);
    }
  } catch (e) {
    dashboardData.value.activities.unshift({
      id: Date.now(),

      ...newActivity,

      time_ago: "Baru saja",
    });
  }
}

// ======================================================
// AI PARSER
// ======================================================

function handleAiQuestionsSaved() {
  showToast(
    "✨ 3 Soal baru dari dokumen berhasil diimpor ke Bank Soal MatrIQ!",
  );

  dashboardData.value.stats.target_questions += 3;
}
</script>

<template>
  <div>
    <div
      class="bg-[#F8FAFC] text-slate-800 font-sans antialiased min-h-screen selection:bg-blue-600 selection:text-white"
    >
      <Sidebar
        :is-open="isSidebarOpen"
        @navigate="handleNavigation"
        @close="isSidebarOpen = false"
      />

      <div class="flex min-h-screen min-w-0 flex-col lg:ml-[260px]">
        <TopNavbar
          :user="dashboardData.user"
          :db-connected="dashboardData.dbStatus?.isConnected"
          @search="handleSearch"
          @open-ai-parser="isAiParserOpen = true"
          @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        />

        <main
          class="mx-auto grid w-full max-w-[1536px] flex-1 grid-cols-12 gap-4 px-4 pb-8 pt-2 sm:gap-6 sm:px-6 lg:gap-7 lg:px-8 lg:pb-10"
        >
          <section
            class="col-span-12 flex flex-col gap-4 sm:gap-6 xl:col-span-8"
            data-purpose="primary-content-column"
          >
            <WelcomeBanner :name="dashboardData.user?.name" />

            <HeroStudyCard
              :completed-count="dashboardData.stats?.completed_questions"
              :target-count="dashboardData.stats?.target_questions"
              @start-practice="isPracticeOpen = true"
            />

            <FeatureGrid @select-feature="handleFeatureSelect" />

            <RecommendationBanner
              :recommendation="dashboardData.recommendation"
              @open-recommendation="isPracticeOpen = true"
            />
          </section>

          <aside
            class="col-span-12 flex flex-col gap-4 sm:gap-6 xl:col-span-4"
            data-purpose="secondary-insight-column"
          >
            <StatSummary
              :streak-days="dashboardData.stats?.streak_days"
              :total-hours="dashboardData.stats?.total_hours"
            />

            <OverallProgress
              :percentage="dashboardData.stats?.overall_progress_pct"
              :categories="dashboardData.categories"
              @view-all-progress="isPracticeOpen = true"
            />

            <TodayTasks
              :tasks="filteredTasks"
              @toggle-task="handleToggleTask"
              @add-task="handleAddTask"
            />

            <RecentActivities
              :activities="dashboardData.activities"
              @view-all-activities="isPracticeOpen = true"
            />
          </aside>
        </main>
      </div>

      <PracticeModal
        :is-open="isPracticeOpen"
        @close="isPracticeOpen = false"
        @completed="handlePracticeCompleted"
      />

      <AiParserModal
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
</template>
