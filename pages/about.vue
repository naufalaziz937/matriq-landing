<script setup lang="ts">
import {
  BookOpenCheck,
  CalendarCheck2,
  Brain,
  ClipboardList,
  ChartNoAxesCombined,
  Award,
  Route,
  Heart,
  Code2,
  Database,
  Cloud,
  Sparkles,
  Github,
  Instagram,
  ExternalLink,
} from "lucide-vue-next";
import { aboutConfig } from "~/config/about";

definePageMeta({ layout: "default" });

const purposes = [
  { title: "Merencanakan belajar", icon: CalendarCheck2 },
  { title: "Latihan per materi & subtes", icon: Brain },
  { title: "Mencatat tryout eksternal", icon: ClipboardList },
  { title: "Melihat perkembangan skor", icon: ChartNoAxesCombined },
  { title: "Menentukan fokus belajar", icon: Route },
  { title: "Menjaga konsistensi belajar", icon: Heart },
];
const features = [
  {
    title: "Roadmap",
    description: "Arah belajar yang lebih jelas.",
    icon: Route,
  },
  {
    title: "Study Plan",
    description: "Rencana belajar yang teratur.",
    icon: CalendarCheck2,
  },
  { title: "Practice", description: "Latihan soal bertahap.", icon: Brain },
  {
    title: "Rekap Tryout",
    description: "Catat hasil dari platform eksternal.",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    description: "Pantau pola dan progres.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Achievements",
    description: "Rayakan konsistensi belajar.",
    icon: Award,
  },
];
const technologies = [
  { name: "Nuxt", icon: Code2 },
  { name: "Vue", icon: Code2 },
  { name: "Tailwind CSS", icon: Sparkles },
  { name: "Node.js", icon: Code2 },
  { name: "Express", icon: Code2 },
  { name: "PostgreSQL", icon: Database },
  { name: "Sequelize", icon: Database },
  { name: "Cloudinary", icon: Cloud },
  { name: "Lucide", icon: Sparkles },
  { name: "Lenis", icon: Sparkles },
  { name: "VueUse Motion", icon: Sparkles },
];
const creatorName = aboutConfig.creatorName || "Nazwan Naufal";
const creatorLinks = [
  { label: "GitHub", href: aboutConfig.github, icon: Github },
  { label: "Instagram", href: aboutConfig.instagram, icon: Instagram },
].filter((item) => Boolean(item.href));
</script>

<template>
  <div
    class="mx-auto w-full max-w-6xl overflow-hidden px-4 py-7 sm:px-6 sm:py-10 lg:px-8"
  >
    <section
      class="about-reveal relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-amber-50 px-5 py-8 text-center shadow-sm sm:px-10 sm:py-12"
    >
      <div
        class="absolute -left-12 top-4 h-36 w-36 rounded-full bg-blue-200/35 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="absolute -right-8 bottom-0 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative mx-auto flex max-w-3xl flex-col items-center">
        <img
          src="/mascot/logo-teks.svg"
          alt="MatrIQ"
          class="h-16 w-auto sm:h-20"
          draggable="false"
        /><img
          src="/mascot/duduk-bg.svg"
          alt="Maskot MatrIQ"
          class="about-mascot -mb-5 mt-2 h-28 w-auto sm:h-36"
          draggable="false"
        />
        <p
          class="mt-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm"
        >
          Personal educational technology project
        </p>
        <h1
          class="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
        >
          Tentang MatrIQ
        </h1>
        <p
          class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base"
        >
          MatrIQ adalah platform belajar dan progress tracker yang dirancang
          untuk membantu pejuang UTBK belajar lebih terarah, memantau
          perkembangan, dan memahami progres mereka dari waktu ke waktu.
        </p>
      </div>
    </section>

    <section
      class="about-reveal mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]"
    >
      <article
        class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7"
      >
        <div class="flex items-center gap-2">
          <Heart class="h-5 w-5 text-orange-500" />
          <h2 class="text-xl font-bold text-slate-900">Kenapa MatrIQ dibuat</h2>
        </div>
        <p class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
          {{ aboutConfig.creatorStory }}
        </p>
      </article>
      <aside
        class="rounded-3xl border border-blue-100 bg-blue-50/60 p-5 sm:p-7"
      >
        <div class="flex items-center gap-2">
          <BookOpenCheck class="h-5 w-5 text-blue-600" />
          <h2 class="text-xl font-bold text-slate-900">
            Untuk apa MatrIQ dibuat
          </h2>
        </div>
        <div class="mt-5 grid gap-2">
          <div
            v-for="item in purposes"
            :key="item.title"
            class="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2.5 text-sm font-semibold text-slate-700"
          >
            <component
              :is="item.icon"
              class="h-4 w-4 shrink-0 text-blue-600"
            />{{ item.title }}
          </div>
        </div>
      </aside>
    </section>

    <section class="about-reveal mt-8">
      <div class="mb-4 text-center">
        <p class="text-xs font-bold uppercase tracking-widest text-blue-600">
          Yang sudah ada
        </p>
        <h2 class="mt-1 text-2xl font-bold text-slate-900">Fitur utama</h2>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in features"
          :key="item.title"
          class="about-card rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
            ><component :is="item.icon" class="h-5 w-5"
          /></span>
          <h3 class="mt-3 font-bold text-slate-900">{{ item.title }}</h3>
          <p class="mt-1 text-sm text-slate-500">{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="about-reveal mt-8 grid gap-5 lg:grid-cols-2">
      <article
        class="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7"
      >
        <div class="flex items-center gap-2">
          <Code2 class="h-5 w-5 text-blue-600" />
          <h2 class="text-xl font-bold text-slate-900">Dibangun dengan</h2>
        </div>
        <p class="mt-2 text-sm text-slate-500">
          Teknologi yang dipakai dalam MatrIQ saat ini.
        </p>
        <div class="mt-5 flex flex-wrap gap-2">
          <span
            v-for="item in technologies"
            :key="item.name"
            class="about-tech inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/60 px-3 py-1.5 text-xs font-semibold text-slate-700"
            ><component :is="item.icon" class="h-3.5 w-3.5 text-blue-600" />{{
              item.name
            }}</span
          >
        </div>
      </article>
      <article
        class="rounded-3xl border border-amber-100 bg-amber-50/65 p-5 shadow-sm sm:p-7"
      >
        <div class="flex items-center gap-2">
          <Sparkles class="h-5 w-5 text-orange-500" />
          <h2 class="text-xl font-bold text-slate-900">
            Prototype / In Development
          </h2>
        </div>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          MatrIQ masih terus dikembangkan. Feedback pengguna membantu menentukan
          perbaikan dan fitur berikutnya.
        </p>
        <div class="mt-5 border-t border-amber-200 pt-4">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500">
            Dibuat oleh
          </p>
          <p class="mt-1 font-bold text-slate-900">{{ creatorName }}</p>
          <p class="text-sm text-slate-600">{{ aboutConfig.creatorRole }}</p>
          <div v-if="creatorLinks.length" class="mt-4 flex flex-wrap gap-2">
            <a
              v-for="item in creatorLinks"
              :key="item.label"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600"
              ><component :is="item.icon" class="h-4 w-4" />{{ item.label
              }}<ExternalLink class="h-3.5 w-3.5"
            /></a>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.about-reveal {
  animation: about-reveal 0.45s ease both;
}
.about-reveal:nth-of-type(2) {
  animation-delay: 0.06s;
}
.about-reveal:nth-of-type(3) {
  animation-delay: 0.12s;
}
.about-reveal:nth-of-type(4) {
  animation-delay: 0.18s;
}
.about-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.about-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -8px rgba(37, 99, 235, 0.18);
}
.about-mascot {
  animation: mascot-float 4s ease-in-out infinite;
}
.about-tech {
  animation: about-reveal 0.35s ease both;
}
@keyframes about-reveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes mascot-float {
  50% {
    transform: translateY(-6px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .about-reveal,
  .about-tech,
  .about-mascot {
    animation: none;
  }
  .about-card:hover {
    transform: none;
  }
}
</style>
