<script setup>
import { useAuthStore } from "~/stores/api/auth";

definePageMeta({ layout: false });

useHead({
  title: "Daftar Akun MatrIQ - UTBK Companion",
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
  ],
});

const authStore = useAuthStore();
const form = reactive({
  name: "",
  email: "",
  status: "k12",
  target: "Institut Teknologi Bandung",
  password: "",
  agree: true,
});
const formError = ref("");
const formSuccess = ref(false);

async function handleRegister() {
  formError.value = "";
  if (!form.agree) {
    formError.value = "Setujui ketentuan layanan terlebih dahulu.";
    return;
  }
  const result = await authStore.register({
    nama: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
  });
  if (result.success) {
    formSuccess.value = true;
  } else {
    formError.value = result.message || "Registrasi gagal.";
  }
}

function handleGoogleSignup() {
  formError.value = "Pendaftaran Google belum tersedia.";
}
</script>

<template>
  <div class="min-h-screen text-slate-800 antialiased flex flex-col justify-between relative overflow-x-hidden font-jakarta bg-brand-bg">
    <!-- Subtle Background Accent Blobs -->
    <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-100/70 blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-blue-100/70 blur-3xl pointer-events-none"></div>

    <!-- Top Header -->
    <header class="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-extrabold text-xl">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <span class="text-2xl font-extrabold tracking-tight text-blue-900">Matr<span class="text-blue-600">IQ</span></span>
          <span class="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full border border-orange-200">Daftar Akun Baru</span>
        </div>
      </div>

      <div class="flex items-center gap-3 text-sm">
        <span class="text-slate-500 hidden sm:inline">Sudah punya akun?</span>
        <NuxtLink to="/login" class="font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-xl transition shadow-sm hover:shadow">
          Masuk di Sini
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content Box -->
    <main class="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex-1 flex items-center justify-center z-10">
      <div class="w-full grid grid-cols-1 lg:grid-cols-12 bg-white border border-blue-100/80 rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden my-4">

        <!-- Left Column: Registration Benefits & Onboarding Preview (5 cols) -->
        <div class="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div class="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-amber-400/20 blur-2xl pointer-events-none"></div>

          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-semibold text-blue-100 mb-6">
              <span class="text-amber-400">✨</span> Onboarding Belajar Personal
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight leading-snug mb-3">
              Mulai Perjalanan Menembus PTN Impianmu! 🎯
            </h1>
            <p class="text-blue-100 text-sm leading-relaxed mb-6">
              Daftar gratis dalam 1 menit dan dapatkan roadmap belajar otomatis yang disesuaikan dengan target jurusan dan kemampuan awalmu.
            </p>

            <!-- Step Feature List -->
            <div class="space-y-3.5 my-6">
              <div class="flex items-start gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div class="w-7 h-7 rounded-xl bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div>
                  <div class="text-sm font-bold text-white">Diagnostic Test Instan</div>
                  <div class="text-xs text-blue-200">Ketahui titik awal kekuatan & kelemahan 5 subtes UTBK.</div>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div class="w-7 h-7 rounded-xl bg-blue-400 text-slate-900 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div>
                  <div class="text-sm font-bold text-white">Roadmap Bertahap H-84</div>
                  <div class="text-xs text-blue-200">Jadwal harian terstruktur dari fondasi hingga simulasi tryout.</div>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div class="w-7 h-7 rounded-xl bg-emerald-400 text-slate-900 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div>
                  <div class="text-sm font-bold text-white">Prediksi Peluang PTN</div>
                  <div class="text-xs text-blue-200">Algoritma passing grade real-time sesuai skor tryout berkalilmu.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mascot & Community Counter -->
          <div class="pt-4 border-t border-white/15 flex items-center gap-4">
            <div class="flex -space-x-2">
              <div class="w-9 h-9 rounded-full bg-amber-400 border-2 border-blue-900 flex items-center justify-center font-bold text-xs text-slate-900">TB</div>
              <div class="w-9 h-9 rounded-full bg-blue-400 border-2 border-blue-900 flex items-center justify-center font-bold text-xs text-white">AN</div>
              <div class="w-9 h-9 rounded-full bg-emerald-400 border-2 border-blue-900 flex items-center justify-center font-bold text-xs text-white">RF</div>
            </div>
            <div class="text-xs text-blue-100">
              <strong class="text-white">18.400+ siswa kelas 12 & gap year</strong> aktif berjuang di MatrIQ hari ini.
            </div>
          </div>

        </div>

        <!-- Right Column: Registration Form (7 cols) -->
        <div class="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div class="max-w-md mx-auto w-full">
            <!-- Heading -->
            <div class="mb-6">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold mb-2">
                <span>🚀 Akun Belajar Siswa</span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Buat Akun MatrIQ</h2>
              <p class="text-slate-500 text-sm mt-1">Lengkapi data diri untuk personalisasi rencana belajarmu.</p>
            </div>

            <!-- Social Signup (Google) -->
            <button type="button" @click="handleGoogleSignup" class="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition mb-5">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Daftar Cepat dengan Google
            </button>

            <!-- Divider -->
            <div class="relative flex items-center justify-center mb-5">
              <div class="border-t border-slate-200 w-full"></div>
              <span class="bg-white px-3 text-xs font-semibold text-slate-400 uppercase">atau isi formulir</span>
            </div>

            <!-- Form Fields -->
            <form class="space-y-3.5" @submit.prevent="handleRegister">\n              <p v-if="formError" role="alert" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ formError }}</p>\n              <p v-if="formSuccess" role="status" class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Akun berhasil dibuat. Silakan masuk untuk melanjutkan.</p>
              <div>
                <label for="reg-name" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  id="reg-name"
                  v-model="form.name"
                  type="text"
                  placeholder="Contoh: Theo Budianto"
                  class="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl text-sm font-medium text-slate-800 transition outline-none"
                  required
                >
              </div>

              <div>
                <label for="reg-email" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Aktif</label>
                <input
                  id="reg-email"
                  v-model="form.email"
                  type="email"
                  placeholder="nama@email.com"
                  class="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl text-sm font-medium text-slate-800 transition outline-none"
                  required
                >
              </div>

              <!-- Target Kampus & Status Siswa (2 columns) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="reg-status" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Status Belajar</label>
                  <select id="reg-status" v-model="form.status" class="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl text-sm font-medium text-slate-800 transition outline-none">
                    <option value="k12">Kelas 12 SMA/SMK</option>
                    <option value="gap">Gap Year (Alumni)</option>
                    <option value="k11">Kelas 11 SMA</option>
                  </select>
                </div>
                <div>
                  <label for="reg-target" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Target PTN Pilihan 1</label>
                  <input
                    id="reg-target"
                    v-model="form.target"
                    type="text"
                    placeholder="Misal: ITB, UI, UGM"
                    class="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl text-sm font-medium text-slate-800 transition outline-none"
                  >
                </div>
              </div>

              <div>
                <label for="reg-password" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Kata Sandi</label>
                <input
                  id="reg-password"
                  v-model="form.password"
                  type="password"
                  placeholder="Minimal 8 karakter kombinasi"
                  class="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl text-sm font-medium text-slate-800 transition outline-none"
                  required
                >
                <p class="text-[11px] text-slate-400 mt-1">Gunakan kombinasi huruf, angka, dan simbol.</p>
              </div>

              <div class="pt-1">
                <label class="flex items-start gap-2 cursor-pointer">
                  <input v-model="form.agree" type="checkbox" class="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300">
                  <span class="text-xs text-slate-600 leading-tight">
                    Saya menyetujui <NuxtLink to="/syarat" class="text-blue-600 font-bold hover:underline">Ketentuan Layanan</NuxtLink> & <NuxtLink to="/privasi" class="text-blue-600 font-bold hover:underline">Kebijakan Privasi</NuxtLink> MatrIQ.
                  </span>
                </label>
              </div>

              <!-- Submit CTA -->
              <button type="submit" :disabled="authStore.isLoading" class="w-full py-3.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 mt-2">
                <span>{{ authStore.isLoading ? "Membuat akun..." : "Buat Akun & Mulai Belajar Gratis" }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            <!-- Back to login footer -->
            <div class="mt-6 text-center text-xs text-slate-500">
              Sudah memiliki akun terdaftar? <NuxtLink to="/login" class="font-bold text-blue-600 hover:text-blue-700">Masuk di sini</NuxtLink>
            </div>

          </div>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-400">
      <p>© 2025 MatrIQ UTBK Companion. Platform belajar terstruktur & terpercaya persiapan SNBT.</p>
    </footer>
  </div>
</template>

<style scoped>
.font-jakarta {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>


