export interface DashboardUser {
  id?: number;
  name: string;
  role: string;
  class_level: string;
  avatar_initial: string;
  foto_profile?: string | null;
}

export interface DashboardTask {
  id: number;
  title: string;
  questions_count: number;
  accuracy_pct: number;
  is_completed: boolean;
  icon_symbol?: string;
  bg_color?: string;
  text_color?: string;
}

export interface DashboardData {
  user: DashboardUser;
  stats: Record<string, number>;
  categories: Array<Record<string, string | number>>;
  tasks: DashboardTask[];
  activities: Array<Record<string, unknown>>;
  recommendation: Record<string, string>;
  dbStatus: {
    isConnected: boolean;
    provider: string;
  };
}

export interface OnboardingData {
  no_hp: string;
  gender: "L" | "P";
  foto_profile?: File | null;
  sekolah: string;
  kelas: string;
  tahun_lulus: number;
  provinsi: string;
  kota_kab: string;
  pilihan: string | number;
  target_score: number | null;
}
