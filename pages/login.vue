<script setup>
import {
  Mail,
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
  title: "Masuk - MatrIQ UTBK Companion",
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
    },
  ],
});

const route = useRoute();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const remember = ref(true);
const showPassword = ref(false);
const formError = ref("");
const successMessage = ref("");

onMounted(() => {
  if (route.query.registered === "1") {
    successMessage.value =
      "Akun berhasil dibuat! Silakan masuk dengan email dan kata sandi Anda.";
  }
});

async function handleLogin() {
  formError.value = "";
  successMessage.value = "";

  const trimmedEmail = email.value.trim();
  if (!trimmedEmail) {
    formError.value = "Email wajib diisi.";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    formError.value = "Format email tidak valid.";
    return;
  }

  if (!password.value) {
    formError.value = "Password wajib diisi.";
    return;
  }

  const result = await authStore.login(
    trimmedEmail.toLowerCase(),
    password.value,
  );
  if (result.success) {
    if (import.meta.client) {
      localStorage.setItem("justLoggedIn", "1");
    }
    await navigateTo("/dashboard");
  } else {
    formError.value =
      result.message || "Email atau password yang Anda masukkan salah.";
  }
}

function handleForgotPassword() {
  alert(
    "Untuk saat ini, silakan hubungi tim bantuan MatrIQ jika Anda lupa kata sandi akun.",
  );
}
</script>

<template>
  <div
    data-lenis-prevent
    class="relative flex h-dvh max-h-dvh min-h-dvh w-full flex-col justify-between items-center overflow-x-hidden overflow-y-auto sm:overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-[#F1F5FD] to-[#EBF2FE] text-slate-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-700"
  >
    <!-- Ambient Decorative Background Elements -->
    <div
      class="pointer-events-none absolute -top-24 left-1/2 -z-0 h-[360px] w-[580px] -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl animate-ambient-glow"
    ></div>
    <div
      class="pointer-events-none absolute bottom-6 -left-20 -z-0 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute top-1/3 -right-20 -z-0 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl"
    ></div>

    <!-- Soft floating math/learning background symbols -->
    <div
      class="pointer-events-none absolute left-12 top-10 hidden select-none text-2xl font-black text-blue-200/70 sm:block animate-float-slow"
    >
      ∑
    </div>
    <div
      class="pointer-events-none absolute bottom-20 left-20 hidden select-none text-xl font-bold text-blue-300/50 sm:block animate-mascot"
      style="animation-delay: 1s"
    >
      π
    </div>
    <div
      class="pointer-events-none absolute right-16 top-16 hidden select-none text-xl font-bold text-blue-200/70 sm:block animate-float-slow"
      style="animation-delay: 1.5s"
    >
      ∫dx
    </div>
    <div
      class="pointer-events-none absolute bottom-24 right-20 hidden select-none text-xl font-black text-amber-200/70 sm:block animate-mascot"
      style="animation-delay: 0.5s"
    >
      √x
    </div>

    <!-- Micro Header / Top spacing container -->
    <header
      class="z-10 flex w-full flex-shrink-0 items-center justify-center px-4 pt-3 sm:pt-4"
    >
      <NuxtLink
        to="/"
        class="inline-block transition-transform hover:scale-105"
        aria-label="Beranda MatrIQ"
      >
        <img
          src="/mascot/logo-teks.svg"
          alt="MatrIQ Logo"
          class="h-9 sm:h-10 w-auto object-contain drop-shadow-sm"
        />
      </NuxtLink>
    </header>

    <!-- Main Single-Centered Vertical Content (Max 420px) -->
    <main
      class="relative z-10 my-auto flex w-full max-w-[420px] flex-col items-center px-4 py-2 sm:py-0"
    >
      <!-- Mascot Avatar & Friendly Badge -->
      <div class="relative mb-2 flex flex-col items-center">
        <div class="relative animate-mascot">
          <img
            src="/mascot/senang.svg"
            alt="MatrIQ Mascot"
            class="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-md select-none pointer-events-none"
          />
          <span
            class="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full border border-blue-100 bg-white px-2 py-0.5 text-[10px] font-extrabold text-blue-600 shadow-sm select-none"
          >
            <span
              class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
            ></span>
            Siap UTBK!
          </span>
        </div>
      </div>

      <!-- Title & Subtitle -->
      <div class="mb-3 sm:mb-4 text-center">
        <h1 class="text-xl font-bold tracking-tight text-slate-900">
          Selamat datang kembali
        </h1>
        <p class="mt-0.5 text-xs font-medium text-slate-500">
          Masuk ke akun MatrIQ kamu.
        </p>
      </div>

      <!-- Clean Card Container -->
      <div
        class="relative w-full rounded-2xl border border-blue-100/90 bg-white p-5 sm:p-6 shadow-sm shadow-blue-950/5"
      >
        <!-- Success Banner -->
        <div
          v-if="successMessage"
          role="status"
          class="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-700"
        >
          <CheckCircle2 class="h-4 w-4 flex-shrink-0 text-emerald-600" />
          <span class="text-[11px] font-semibold leading-tight">{{
            successMessage
          }}</span>
        </div>

        <!-- Inline Error Banner -->
        <div
          v-if="formError"
          role="alert"
          class="mb-3.5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-700"
        >
          <AlertCircle class="h-4 w-4 flex-shrink-0 text-rose-500" />
          <span class="text-[11px] font-semibold leading-tight">{{
            formError
          }}</span>
        </div>

        <!-- Login Form -->
        <form class="space-y-3.5" @submit.prevent="handleLogin">
          <!-- Field 1: Email -->
          <div>
            <label
              for="login-email"
              class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
            >
              Email
            </label>
            <div class="group relative">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-blue-600"
              >
                <Mail class="h-4 w-4" />
              </div>
              <input
                id="login-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="nama@email.com"
                required
                class="h-10 sm:h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <!-- Field 2: Password -->
          <div>
            <div class="mb-1 flex items-center justify-between">
              <label
                for="login-password"
                class="block text-[11px] font-bold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>
              <button
                type="button"
                class="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                @click="handleForgotPassword"
              >
                Lupa password?
              </button>
            </div>
            <div class="group relative">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-blue-600"
              >
                <Lock class="h-4 w-4" />
              </div>
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                required
                class="h-10 sm:h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                :aria-label="
                  showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                "
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-700 focus:text-blue-600 focus:outline-none"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center pt-0.5">
            <label class="flex cursor-pointer select-none items-center gap-2">
              <input
                id="rememberMe"
                v-model="remember"
                type="checkbox"
                class="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition"
              />
              <span
                class="text-xs font-medium text-slate-600 hover:text-slate-800"
                >Ingat saya</span
              >
            </label>
          </div>

          <!-- Primary Action CTA Button -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="mt-2 flex h-10 sm:h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-150 hover:bg-[#1D4ED8] hover:shadow-blue-600/30 active:scale-[0.985] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Loader2
              v-if="authStore.isLoading"
              class="h-4 w-4 animate-spin text-white"
            />
            <span>{{ authStore.isLoading ? "Memproses..." : "Masuk" }}</span>
          </button>
        </form>

        <!-- Account Switch Footer -->
        <div
          class="mt-4 border-t border-slate-100 pt-3.5 text-center text-xs font-medium text-slate-500"
        >
          Belum punya akun?
          <NuxtLink
            to="/register"
            class="ml-1 font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Daftar
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Clean Bottom Sub-footer (Strictly fits desktop viewport) -->
    <footer
      class="z-10 w-full flex-shrink-0 px-4 py-2 sm:py-3 text-center text-[11px] text-slate-400"
    >
      <span>© 2026 MatrIQ. UTBK Companion platform.</span>
    </footer>
  </div>
</template>

<style scoped>
@keyframes gentleFloat {
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

@keyframes softPulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.65;
    transform: scale(1.04);
  }
}

.animate-mascot {
  animation: gentleFloat 3.8s ease-in-out infinite;
}

.animate-float-slow {
  animation: softFloatSlow 7s ease-in-out infinite;
}

.animate-ambient-glow {
  animation: softPulse 6s ease-in-out infinite;
}
</style>
