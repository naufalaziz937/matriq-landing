import type { DashboardData } from "~/types/dashboard";

export function createDefaultDashboardData(): DashboardData {
  return {
    user: {
      name: "Pengguna",
      role: "Siswa",
      class_level: "Kelas 12",
      avatar_initial: "P",
      foto_profile: null,
    },
    stats: {
      streak_days: 7,
      total_hours: 48,
      target_questions: 50,
      completed_questions: 40,
      overall_progress_pct: 68,
    },
    categories: [
      { name: "Materi", completed: 12, total: 18, color: "bg-blue-600" },
      { name: "Latihan Soal", completed: 342, total: 500, color: "bg-amber-400" },
      { name: "Tryout", completed: 3, total: 5, color: "bg-teal-500" },
    ],
    tasks: [
      { id: 1, title: "Matematika - Aljabar", questions_count: 15, accuracy_pct: 85, is_completed: true, icon_symbol: "∑", bg_color: "bg-blue-100", text_color: "text-blue-700" },
      { id: 2, title: "Bahasa Indonesia - Teks", questions_count: 10, accuracy_pct: 70, is_completed: true, icon_symbol: "📖", bg_color: "bg-amber-100", text_color: "text-amber-700" },
      { id: 3, title: "Penalaran Umum - Pola", questions_count: 8, accuracy_pct: 63, is_completed: false, icon_symbol: "🧠", bg_color: "bg-purple-100", text_color: "text-purple-700" },
      { id: 4, title: "Bahasa Inggris - Reading", questions_count: 12, accuracy_pct: 50, is_completed: false, icon_symbol: "🚩", bg_color: "bg-orange-100", text_color: "text-orange-700" },
    ],
    activities: [
      { id: 1, title: "Latihan Penalaran Matematika", subtitle: "15 Soal · 85% Akurasi", time_ago: "20 mnt lalu", badge_type: "time", icon_type: "math", color: "blue" },
      { id: 2, title: "Simulasi Tryout UTBK #04", subtitle: "Skor 712 · Selesai", time_ago: "Kemarin", badge_type: "success", icon_type: "tryout", color: "amber" },
      { id: 3, title: "Materi Pemahaman Bacaan", subtitle: "Bab 3 Selesai", time_ago: "2 hari lalu", badge_type: "time", icon_type: "reading", color: "blue" },
    ],
    recommendation: {
      tag: "Rekomendasi Belajar",
      title: "Kamu perlu fokus ke Materi Aljabar di Penalaran Matematika.",
      description: "Akurasi kamu masih 58% dari 42 soal terakhir.",
      action_text: "Lihat Rekomendasi",
    },
    dbStatus: {
      isConnected: false,
      provider: "Connecting...",
    },
  };
}
