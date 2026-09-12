<script setup>
import { useAuthStore } from "~/stores/api/auth";

definePageMeta({ layout: false });

useHead({
  title: "Masuk ke MatrIQ - UTBK Companion",
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
  ],
});

const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const remember = ref(true);
const showPassword = ref(false);
const formError = ref("");

async function handleLogin() {
  formError.value = "";
  const result = await authStore.login(email.value.trim().toLowerCase(), password.value);
  if (result.success) {
    if (import.meta.client) localStorage.setItem("justLoggedIn", "1");
    await navigateTo("/dashboard");
  } else {
    formError.value = result.message || "Email atau password salah.";
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 antialiased font-jakarta">
    <header class="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <NuxtLink to="/" class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 text-xl font-extrabold text-white shadow-md shadow-blue-500/20">M</div>
        <span class="text-2xl font-extrabold tracking-tight text-blue-900">Matr<span class="text-blue-600">IQ</span></span>
      </NuxtLink>
      <div class="flex items-center gap-2 text-sm">
        <span class="hidden text-slate-500 sm:inline">Belum punya akun?</span>
        <NuxtLink to="/register" class="rounded-xl border border-blue-200 bg-white px-4 py-2 font-bold text-blue-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700">Daftar Sekarang</NuxtLink>
      </div>
    </header>

    <main class="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 pb-8 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:pb-14">
      <section class="relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 p-8 text-white shadow-xl shadow-blue-900/10 lg:col-span-6 lg:flex lg:min-h-[650px] lg:flex-col lg:justify-between">
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl"></div>
        <div class="relative z-10">
          <div class="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100"><span class="text-amber-300">✨</span> Teman belajar UTBK kamu</div>
          <h1 class="max-w-lg text-4xl font-extrabold leading-tight tracking-tight">Langkah kecil hari ini, hasil besar nanti! 🚀</h1>
          <p class="mt-4 max-w-md text-sm leading-relaxed text-blue-100">Susun target, latihan terarah, dan pantau progres belajarmu bersama MatrIQ.</p>
          <div class="mt-10 grid max-w-md grid-cols-3 gap-3">
            <div class="rounded-2xl border border-white/10 bg-white/10 p-3 text-center"><div class="text-xl font-extrabold">84</div><div class="mt-1 text-[11px] text-blue-200">Hari roadmap</div></div>
            <div class="rounded-2xl border border-white/10 bg-white/10 p-3 text-center"><div class="text-xl font-extrabold">5</div><div class="mt-1 text-[11px] text-blue-200">Subtes UTBK</div></div>
            <div class="rounded-2xl border border-white/10 bg-white/10 p-3 text-center"><div class="text-xl font-extrabold">18K+</div><div class="mt-1 text-[11px] text-blue-200">Siswa aktif</div></div>
          </div>
        </div>
        <div class="relative z-10 flex items-end justify-between gap-4">
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-blue-100">"Belajar konsisten jadi lebih ringan kalau punya arah."</div>
          <img src="/mascot/senang.svg" alt="Maskot MatrIQ" class="h-36 w-36 object-contain drop-shadow-xl" />
        </div>
      </section>

      <section class="flex items-center lg:col-span-6">
        <div class="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-blue-900/5 sm:p-10">
          <div class="mb-7">
            <div class="mb-2 inline-flex rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">🚀 Akun Siswa</div>
            <h2 class="text-3xl font-extrabold tracking-tight text-slate-900">👋 Selamat Datang Kembali!</h2>
            <p class="mt-2 text-sm text-slate-500">Masuk ke akun MatrIQ dan lanjutkan target belajarmu.</p>
          </div>

          <button type="button" class="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
            <span class="text-lg font-bold text-blue-500">G</span> Masuk dengan Google
          </button>
          <div class="mb-5 flex items-center gap-3 text-xs font-semibold uppercase text-slate-400"><span class="h-px flex-1 bg-slate-200"></span><span class="whitespace-nowrap">atau dengan email</span><span class="h-px flex-1 bg-slate-200"></span></div>

          <form class="space-y-4" @submit.prevent="handleLogin">
            <p v-if="formError" role="alert" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ formError }}</p>
            <div><label for="login-email" class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">Email / No. WhatsApp</label><input id="login-email" v-model="email" type="email" autocomplete="email" placeholder="nama@email.com" required class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"></div>
            <div><div class="mb-1 flex items-center justify-between"><label for="login-password" class="block text-xs font-bold uppercase tracking-wider text-slate-700">Kata Sandi</label><NuxtLink to="/lupa-password" class="text-xs font-semibold text-blue-600 hover:underline">Lupa kata sandi?</NuxtLink></div><div class="relative"><input id="login-password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-24 text-sm font-medium outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"><button type="button" class="absolute inset-y-0 right-3 text-xs font-semibold text-blue-600" @click="showPassword = !showPassword">{{ showPassword ? "Sembunyikan" : "Tampilkan" }}</button></div></div>
            <label class="flex items-center gap-2 text-xs text-slate-500"><input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"> Ingat saya di perangkat ini</label>
            <button type="submit" :disabled="authStore.isLoading" class="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{{ authStore.isLoading ? "Memproses..." : "Masuk ke Dashboard" }} <span class="ml-1">→</span></button>
          </form>

          <div class="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4"><div class="text-sm font-bold text-orange-800">Belum siap berlangganan?</div><p class="mt-1 text-xs leading-relaxed text-orange-700">Coba fitur latihan dan roadmap belajar MatrIQ secara gratis.</p></div>
          <p class="mt-6 text-center text-xs text-slate-500">Belum punya akun? <NuxtLink to="/register" class="font-bold text-blue-600 hover:text-blue-700">Daftar gratis sekarang</NuxtLink></p>
        </div>
      </section>
    </main>
    <footer class="px-6 py-4 text-center text-xs text-slate-400">© 2025 MatrIQ UTBK Companion. Platform belajar terstruktur & terpercaya persiapan SNBT.</footer>
  </div>
</template>

<style scoped>
.font-jakarta { font-family: "Plus Jakarta Sans", sans-serif; }
</style>

