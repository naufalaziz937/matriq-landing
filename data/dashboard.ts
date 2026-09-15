import type { DashboardData } from "~/types/dashboard";

export function createDefaultDashboardData(): DashboardData {
  return {
    user: {
      name: "Pengguna",
      role: "Siswa",
      class_level: "",
      avatar_initial: "P",
      foto_profile: null,
    },
    stats: {
      streak_days: 0,
      total_hours: 0,
      target_questions: 50,
      completed_questions: 0,
      overall_progress_pct: 0,
    },
    categories: [],
    tasks: [],
    activities: [],
    recommendation: {},
    dbStatus: {
      isConnected: false,
      provider: "Connecting...",
    },
  };
}
