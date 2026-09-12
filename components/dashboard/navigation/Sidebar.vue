<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
    aria-hidden="true"
    @click="$emit('close')"
  />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(280px,86vw)] flex-col justify-between overflow-y-auto border-r border-slate-100 bg-white shadow-2xl transition-transform duration-300 lg:z-30 lg:w-[260px] lg:translate-x-0 lg:shadow-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    data-purpose="navigation-sidebar"
  >
    <div>
      <!-- Brand Logo Section -->
      <div class="flex h-20 items-center justify-between px-5">
        <img
          src="/mascot/logo-teks.svg"
          alt="MatrIQ Logo"
          class="h-16 w-auto object-contain"
          draggable="false"
        >
        <button
          type="button"
          class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Tutup menu navigasi"
          @click="$emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Navigation Menu Items -->
      <nav class="px-3.5 space-y-1.5 font-semibold text-[14.5px]">
        <button
          v-for="item in navItems"
          :key="item.name"
          @click="selectNav(item.name)"
          :class="[
            'w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl transition-all duration-200 text-left font-semibold',
            activeNav === item.name
              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
          ]"
        >
          <component
            :is="item.icon"
            :class="[
              'w-5 h-5 shrink-0 transition-colors',
              activeNav === item.name ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
            ]"
            :stroke-width="activeNav === item.name ? 2.5 : 2"
          />
          <span>{{ item.label }}</span>

          <span
            v-if="item.badge"
            :class="[
              'ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full',
              activeNav === item.name ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
            ]"
          >
            {{ item.badge }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Bottom Mascot Illustration -->
    <div class="relative px-0 pb-0 overflow-hidden pt-6">
      <!-- Floating handwritten message -->
      <div class="absolute top-3 left-6 -rotate-6 animate-pulse-subtle z-10 pointer-events-none">
        <p class="font-handwriting text-[19px] font-bold text-slate-700 leading-tight">
          Semangat<br />terus!
        </p>
        <svg class="w-4 h-4 text-amber-400 absolute -right-2 top-0 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </div>

      <!-- Mascot image: duduk-bg.svg -->
      <img
        src="/mascot/duduk-bg.svg"
        alt="MatrIQ Mascot"
        class="w-full object-contain object-bottom hover:scale-105 transition-transform duration-300 cursor-pointer"
        draggable="false"
      >
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  X,
  Home,
  MapPin,
  CalendarCheck2,
  Target,
  Trophy,
  LineChart,
  Calendar,
  FileText
} from 'lucide-vue-next';

withDefaults(defineProps<{
  isOpen?: boolean;
}>(), {
  isOpen: false,
});

const emit = defineEmits<{
  (e: 'navigate', navName: string): void;
  (e: 'close'): void;
}>();

const activeNav = ref('home');

const navItems = [
  { name: 'home', label: 'Home', icon: Home },
  { name: 'roadmap', label: 'Roadmap', icon: MapPin },
  { name: 'study-plan', label: 'Study Plan', icon: CalendarCheck2 },
  { name: 'practice', label: 'Practice', icon: Target },
  { name: 'tryout', label: 'Tryout', icon: Trophy, badge: 'HOT' },
  { name: 'analytics', label: 'Analytics', icon: LineChart },
  { name: 'calendar', label: 'Calendar', icon: Calendar },
  { name: 'notes', label: 'Notes', icon: FileText }
];

function selectNav(name: string) {
  activeNav.value = name;
  emit('navigate', name);
  emit('close');
}
</script>
