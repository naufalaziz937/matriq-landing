<script setup>
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-vue-next";
import { useAuthStore } from "~/stores/api/auth";

definePageMeta({ layout: false });

useHead({
  title: "Daftar Akun MatrIQ - UTBK Companion",
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
    },
  ],
});

const authStore = useAuthStore();

const form = reactive({
  nama: "",
  email: "",
  no_hp: "",
  gender: "L", // "L" atau "P"
  password: "",
  konfirmasi_password: "",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const formError = ref("");
const isSubmitting = ref(false);

async function handleRegister() {
  formError.value = "";

  const nama = form.nama.trim();
  const email = form.email.trim().toLowerCase();
  const no_hp = form.no_hp.trim();
  const gender = form.gender;
  const password = form.password;
  const konfirmasi_password = form.konfirmasi_password;

  if (
    !nama ||
    !email ||
    !no_hp ||
    !gender ||
    !password ||
    !konfirmasi_password
  ) {
    formError.value = "Semua kolom wajib diisi.";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    formError.value = "Format alamat email belum valid.";
    return;
  }

  if (password.length < 8) {
    formError.value = "Password minimal terdiri dari 8 karakter.";
    return;
  }

  if (password !== konfirmasi_password) {
    formError.value = "Password dan konfirmasi password tidak cocok.";
    return;
  }

  isSubmitting.value = true;
  try {
    const regResult = await authStore.register({
      nama,
      email,
      no_hp,
      gender,
      password,
    });

    if (!regResult.success) {
      formError.value =
        regResult.message || "Registrasi gagal. Silakan coba lagi.";
      return;
    }

    // Auto-login setelah registrasi agar langsung terhubung ke sesi & onboarding
    const loginResult = await authStore.login(email, password);
    if (loginResult.success) {
      if (import.meta.client) {
        localStorage.setItem("justLoggedIn", "1");
      }
      await navigateTo("/dashboard");
    } else {
      // Jika auto-login tidak langsung berhasil, arahkan ke login dengan status sukses
      await navigateTo("/login?registered=1");
    }
  } catch (err) {
    formError.value = "Terjadi kendala saat memproses pendaftaran.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div
    data-lenis-prevent
    class="relative flex h-dvh max-h-dvh min-h-dvh w-full flex-col justify-between overflow-x-hidden overflow-y-auto sm:overflow-hidden bg-[#F8FAFC] text-slate-800 antialiased selection:bg-blue-600 selection:text-white"
  >
    <!-- Subtle Ambient Background Decorations -->
    <div
      class="pointer-events-none fixed -left-20 -top-24 -z-10 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl"
    ></div>
    <div
      class="pointer-events-none fixed -right-20 top-1/3 -z-10 h-96 w-96 rounded-full bg-blue-50/70 blur-3xl"
    ></div>
    <div
      class="pointer-events-none fixed -bottom-24 left-1/3 -z-10 h-80 w-80 rounded-full bg-amber-50/50 blur-3xl"
    ></div>

    <!-- Soft floating math symbols -->
    <div
      class="pointer-events-none absolute left-12 top-10 hidden select-none text-2xl font-black text-blue-200/60 sm:block animate-float-slow"
    >
      ∑
    </div>
    <div
      class="pointer-events-none absolute bottom-20 left-20 hidden select-none text-xl font-bold text-blue-300/40 sm:block animate-mascot"
      style="animation-delay: 1s"
    >
      π
    </div>
    <div
      class="pointer-events-none absolute right-16 top-16 hidden select-none text-xl font-bold text-blue-200/60 sm:block animate-float-slow"
      style="animation-delay: 1.5s"
    >
      ∫dx
    </div>
    <div
      class="pointer-events-none absolute bottom-24 right-20 hidden select-none text-xl font-black text-amber-200/60 sm:block animate-mascot"
      style="animation-delay: 0.5s"
    >
      √x
    </div>

    <!-- Top Minimal Bar: Logo & Mascot Companion -->
    <header class="w-full flex-shrink-0 px-4 pt-2.5 sm:px-6 sm:pt-3 z-10">
      <div class="mx-auto flex max-w-[470px] items-center justify-between">
        <!-- Official Logo MatrIQ -->
        <NuxtLink
          to="/"
          class="flex items-center gap-2 transition-transform hover:scale-105"
          aria-label="Beranda MatrIQ"
        >
          <img
            src="/mascot/logo-teks.svg"
            alt="MatrIQ Logo"
            class="h-8 sm:h-9 w-auto object-contain drop-shadow-sm"
          />
          <span
            class="hidden rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700 uppercase sm:inline-block"
          >
            UTBK Companion
          </span>
        </NuxtLink>

        <!-- Mascot MatrIQ with breathing float -->
        <div class="relative group select-none">
          <img
            src="/mascot/senang.svg"
            alt="MatrIQ Mascot"
            class="h-12 w-12 sm:h-14 sm:w-14 object-contain animate-breathe drop-shadow-md select-none pointer-events-none"
          />
        </div>
      </div>
    </header>

    <!-- Centered Single Card Container (Zero desktop scroll, compact height) -->
    <main
      class="relative z-10 flex flex-1 items-center justify-center px-4 py-1 sm:py-2"
    >
      <div
        class="w-full max-w-[470px] rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/50 transition-all"
      >
        <!-- Card Header -->
        <div class="mb-3 sm:mb-3.5 text-center">
          <h1
            class="text-xl font-bold tracking-tight text-slate-900 leading-tight sm:text-[22px]"
          >
            Buat akun MatrIQ
          </h1>
          <p class="mt-0.5 text-xs font-medium text-slate-500">
            Mulai perjalanan belajarmu.
          </p>
        </div>

        <!-- Compact Form -->
        <form class="space-y-2.5" @submit.prevent="handleRegister">
          <!-- Row 1: Nama Lengkap -->
          <div>
            <label
              for="reg-nama"
              class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
            >
              Nama Lengkap / Panggilan <span class="text-rose-500">*</span>
            </label>
            <div class="group relative">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-blue-600"
              >
                <User class="h-4 w-4" />
              </div>
              <input
                id="reg-nama"
                v-model="form.nama"
                type="text"
                autocomplete="name"
                placeholder="Nama lengkap / panggilan"
                required
                class="h-10 sm:h-10.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <!-- Row 2: Email -->
          <div>
            <label
              for="reg-email"
              class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
            >
              Email <span class="text-rose-500">*</span>
            </label>
            <div class="group relative">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-blue-600"
              >
                <Mail class="h-4 w-4" />
              </div>
              <input
                id="reg-email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="nama@email.com"
                required
                class="h-10 sm:h-10.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <!-- Row 3: 2-Column (No. HP + Gender) -->
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <!-- No. HP -->
            <div>
              <label
                for="reg-nohp"
                class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
              >
                No. WhatsApp / HP <span class="text-rose-500">*</span>
              </label>
              <div class="group relative">
                <div
                  class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-blue-600"
                >
                  <Phone class="h-4 w-4" />
                </div>
                <input
                  id="reg-nohp"
                  v-model="form.no_hp"
                  type="tel"
                  autocomplete="tel"
                  placeholder="08xxxxxxxxxx"
                  required
                  class="h-10 sm:h-10.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <!-- Gender Selector -->
            <div>
              <label
                class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
              >
                Jenis Kelamin <span class="text-rose-500">*</span>
              </label>
              <div
                class="flex h-10 sm:h-10.5 items-center rounded-xl border border-slate-200 bg-slate-50 p-1"
              >
                <button
                  type="button"
                  :class="[
                    'flex-1 h-full rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                    form.gender === 'L'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  ]"
                  @click="form.gender = 'L'"
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  :class="[
                    'flex-1 h-full rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                    form.gender === 'P'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  ]"
                  @click="form.gender = 'P'"
                >
                  Perempuan
                </button>
              </div>
            </div>
          </div>

          <!-- Row 4: 2-Column (Password + Konfirmasi Password) -->
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <!-- Password -->
            <div>
              <label
                for="reg-password"
                class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
              >
                Password <span class="text-rose-500">*</span>
              </label>
              <div class="group relative">
                <div
                  class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-blue-600"
                >
                  <Lock class="h-4 w-4" />
                </div>
                <input
                  id="reg-password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="••••••••"
                  required
                  class="h-10 sm:h-10.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  :aria-label="
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  "
                  class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 transition hover:text-slate-600 focus:outline-none"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Konfirmasi Password -->
            <div>
              <label
                for="reg-confirm"
                class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
              >
                Konfirmasi <span class="text-rose-500">*</span>
              </label>
              <div class="group relative">
                <div
                  class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-blue-600"
                >
                  <Lock class="h-4 w-4" />
                </div>
                <input
                  id="reg-confirm"
                  v-model="form.konfirmasi_password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="••••••••"
                  required
                  class="h-10 sm:h-10.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  :aria-label="
                    showConfirmPassword
                      ? 'Sembunyikan konfirmasi password'
                      : 'Tampilkan konfirmasi password'
                  "
                  class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 transition hover:text-slate-600 focus:outline-none"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <EyeOff v-if="showConfirmPassword" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Inline Error Banner -->
          <div
            v-if="formError"
            role="alert"
            class="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs font-medium text-rose-700"
          >
            <AlertCircle class="h-4 w-4 flex-shrink-0 text-rose-600" />
            <span class="text-[11px] font-semibold leading-tight">{{
              formError
            }}</span>
          </div>

          <!-- Submit Button CTA -->
          <div class="pt-1">
            <button
              type="submit"
              :disabled="isSubmitting || authStore.isLoading"
              class="flex h-10 sm:h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-[#1D4ED8] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-75"
            >
              <Loader2
                v-if="isSubmitting || authStore.isLoading"
                class="h-4 w-4 animate-spin text-white"
              />
              <span>{{
                isSubmitting || authStore.isLoading
                  ? "Membuat akun..."
                  : "Daftar"
              }}</span>
            </button>
          </div>
        </form>

        <!-- Bottom Form Footer -->
        <div
          class="mt-3 border-t border-slate-100 pt-2.5 text-center text-xs text-slate-500"
        >
          Sudah punya akun?
          <NuxtLink
            to="/login"
            class="ml-1 font-bold text-[#2563EB] hover:text-blue-800 transition"
          >
            Masuk
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Legal & Micro Footer (Fits firmly in viewport) -->
    <footer
      class="w-full flex-shrink-0 py-2 sm:py-2.5 text-center text-[11px] text-slate-400 z-10"
    >
      <p>© 2026 MatrIQ UTBK Companion. Seluruh hak cipta dilindungi.</p>
    </footer>
  </div>
</template>

<style scoped>
@keyframes breathe {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.03);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes softFloatSlow {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}

.animate-breathe {
  animation: breathe 4s ease-in-out infinite;
}

.animate-mascot {
  animation: float 3.8s ease-in-out infinite;
}

.animate-float-slow {
  animation: softFloatSlow 7s ease-in-out infinite;
}
</style>
