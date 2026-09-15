<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 select-none" data-purpose="features-grid">
    <!-- Card 1: Latihan Soal (Pastel Blue) -->
    <div
      @click="$emit('select-feature', 'latihan-soal')"
      class="bg-[#EFF6FF] border border-blue-100 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-200 group cursor-pointer card-hover-lift"
    >
      <div>
        <div class="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <Layers class="w-5 h-5 stroke-current" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Latihan Soal</h3>
        <p class="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-[190px]">
          Uji kemampuanmu dengan ribuan soal UTBK.
        </p>
      </div>

      <div class="flex items-center justify-between mt-5 pt-1">
        <button
          class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-blue-700 transition-all"
        >
          <ArrowRight class="w-4 h-4 stroke-[2.5]" />
        </button>

        <!-- Mascot Studying with Idea Bulb -->
        <div class="w-36 h-30 -mr-2 -mb-2 transform group-hover:translate-x-1 transition-transform">
          <img src="/mascot/utbk.svg" 
               alt="Mascot UTBK" 
               class="w-full h-full object-contain object-bottom hover:scale-105 transition-transform duration-300 select-none cursor-pointer drop-shadow-lg" 
               draggable="false"
          >
        </div>
      </div>
    </div>

    <!-- Card 2: Tryout (Pastel Amber/Yellow) -->
    <div
      @click="$emit('select-feature', 'tryout')"
      class="bg-[#FEF9EE] border border-amber-100 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-amber-300 transition-all duration-200 group cursor-pointer card-hover-lift"
    >
      <div>
        <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <BarChart3 class="w-5 h-5 stroke-current" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Rekap Tryout</h3>
        <p class="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-[190px]">
          Pantau hasil tryout dari platform lain.
        </p>
      </div>

      <div class="flex items-center justify-between mt-5 pt-1">
        <button
          class="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-amber-600 transition-all"
        >
          <ArrowRight class="w-4 h-4 stroke-[2.5]" />
        </button>

        <!-- Mascot with UTBK paper -->
        <div class="w-36 h-30 -mr-2 -mb-2 transform group-hover:translate-x-1 transition-transform">
          <img src="/mascot/tryout.svg" 
               alt="Mascot Tryout" 
               class="w-full h-full object-contain object-bottom hover:scale-105 transition-transform duration-300 select-none cursor-pointer drop-shadow-lg" 
               draggable="false"
          >
        </div>
      </div>
    </div>

    <!-- Card 3: Materi & Pembahasan (Soft Sky Blue) -->
    <div
      @click="$emit('select-feature', 'materi-pembahasan')"
      class="bg-[#F0FDF4]/60 border border-slate-200/80 bg-gradient-to-br from-sky-50 to-blue-50/50 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-200 group cursor-pointer card-hover-lift"
    >
      <div>
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <BookOpen class="w-5 h-5 stroke-current" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Materi &amp; Pembahasan</h3>
        <p class="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-[190px]">
          Pelajari materi lengkap dengan penjelasan mudah.
        </p>
      </div>

      <div class="flex items-center justify-between mt-5 pt-1">
        <button
          class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-blue-700 transition-all"
        >
          <ArrowRight class="w-4 h-4 stroke-[2.5]" />
        </button>

        <!-- Mascot Reading Book -->
        <div class="w-36 h-30 -mr-2 -mb-2 transform group-hover:translate-x-1 transition-transform">
          <img src="/mascot/belajar.svg" 
               alt="Mascot Belajar" 
               class="w-full h-full object-contain object-bottom hover:scale-105 transition-transform duration-300 select-none cursor-pointer drop-shadow-lg" 
               draggable="false"
          >
        </div>
      </div>
    </div>

    <!-- Card 4: Roadmap Belajar (Pastel Peach/Coral) -->
    <div
      @click="$emit('select-feature', 'roadmap-belajar')"
      class="bg-[#FFF7ED] border border-orange-100 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-orange-300 transition-all duration-200 group cursor-pointer card-hover-lift"
    >
      <div>
        <div class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <TrendingUp class="w-5 h-5 stroke-current" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">Roadmap Belajar</h3>
        <p class="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-[190px]">
          Ikuti perjalanan belajarmu hingga hari H.
        </p>
      </div>

      <div class="flex items-center justify-between mt-5 pt-1">
        <button
          class="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-orange-600 transition-all"
        >
          <ArrowRight class="w-4 h-4 stroke-[2.5]" />
        </button>

        <!-- Mascot with Flag on Mountain Peak -->
        <div class="w-36 h-30 -mr-2 -mb-2 transform group-hover:translate-x-1 transition-transform">
          <img src="/mascot/ptn.svg" 
               alt="Mascot PTN" 
               class="w-full h-full object-contain object-bottom hover:scale-105 transition-transform duration-300 select-none cursor-pointer drop-shadow-lg" 
               draggable="false"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Layers, BarChart3, BookOpen, TrendingUp, ArrowRight } from 'lucide-vue-next';

defineEmits<{
  (e: 'select-feature', featureId: string): void;
}>();
</script>
