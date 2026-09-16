<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Home, MapPin, Route, CalendarCheck2, Target, Trophy, LineChart, Calendar, FileText, Users, User, BookOpen, Award, GraduationCap, ClipboardList, TrendingUp, ShieldCheck, Download, Settings, Ellipsis, X } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/api/auth';
import { activeMenuForPath, getMenuByRole } from '~/utils/roles';

const emit = defineEmits<{ (event: 'navigate', name: string): void }>();
const route = useRoute();
const authStore = useAuthStore();
const showMore = ref(false);
const icons: Record<string, any> = { Home, MapPin, Route, CalendarCheck2, Target, Trophy, LineChart, Calendar, FileText, Users, User, BookOpen, Award, GraduationCap, ClipboardList, TrendingUp, ShieldCheck, Download, Settings };
const allItems = computed(() => getMenuByRole(authStore.user?.role).filter(item => item.type !== 'divider' && item.path).map(item => ({ ...item, iconComponent: icons[item.icon] })));
const primaryItems = computed(() => allItems.value.length > 5 ? allItems.value.slice(0, 4) : allItems.value.slice(0, 5));
const overflowItems = computed(() => allItems.value.length > 5 ? allItems.value.slice(4) : []);
const activeName = computed(() => activeMenuForPath(route.path, authStore.user?.role));
const moreActive = computed(() => overflowItems.value.some(item => item.name === activeName.value));
function navigate(name: string) { showMore.value = false; emit('navigate', name); }
function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') showMore.value = false; }
watch(() => route.fullPath, () => { showMore.value = false; });
onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="lg:hidden">
    <Transition name="mobile-sheet"><div v-if="showMore" class="fixed inset-0 z-[35] bg-slate-950/35" aria-hidden="true" @click="showMore = false" /></Transition>
    <Transition name="mobile-sheet">
      <section v-if="showMore" data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="mobile-more-title" class="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-[45] max-h-[min(62vh,520px)] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white px-4 pb-4 pt-3 shadow-2xl">
        <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
        <div class="mb-3 flex items-center justify-between"><h2 id="mobile-more-title" class="text-sm font-bold text-slate-900">Menu lainnya</h2><button type="button" class="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Tutup menu lainnya" @click="showMore = false"><X class="h-5 w-5" /></button></div>
        <nav class="grid grid-cols-2 gap-2" aria-label="Menu lainnya">
          <button v-for="item in overflowItems" :key="item.name" type="button" :aria-current="activeName === item.name ? 'page' : undefined" class="flex min-h-14 min-w-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition active:scale-[.98]" :class="activeName === item.name ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-600 hover:bg-slate-50'" @click="navigate(item.name)"><component :is="item.iconComponent" class="h-5 w-5 shrink-0" :stroke-width="activeName === item.name ? 2.5 : 2" /><span class="min-w-0 break-words">{{ item.label }}</span></button>
        </nav>
      </section>
    </Transition>
    <nav class="fixed inset-x-0 bottom-0 z-40 grid min-h-[72px] border-t border-slate-200 bg-white/95 px-1 pt-1.5 shadow-[0_-6px_24px_rgba(15,23,42,0.08)] backdrop-blur" :style="{ gridTemplateColumns: `repeat(${primaryItems.length + (overflowItems.length ? 1 : 0)}, minmax(0, 1fr))`, paddingBottom: 'env(safe-area-inset-bottom)' }" aria-label="Navigasi utama mobile">
      <button v-for="item in primaryItems" :key="item.name" type="button" :aria-current="activeName === item.name ? 'page' : undefined" class="relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold leading-tight transition active:scale-95" :class="activeName === item.name ? 'text-blue-600' : 'text-slate-500'" @click="navigate(item.name)"><span v-if="activeName === item.name" class="absolute top-0 h-1 w-8 rounded-full bg-blue-600" aria-hidden="true" /><component :is="item.iconComponent" class="h-5 w-5 shrink-0" :stroke-width="activeName === item.name ? 2.6 : 2" /><span class="w-full truncate text-center">{{ item.label }}</span></button>
      <button v-if="overflowItems.length" type="button" :aria-current="moreActive ? 'page' : undefined" :aria-expanded="showMore" class="relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold leading-tight transition active:scale-95" :class="moreActive || showMore ? 'text-blue-600' : 'text-slate-500'" @click="showMore = !showMore"><span v-if="moreActive" class="absolute top-0 h-1 w-8 rounded-full bg-blue-600" aria-hidden="true" /><Ellipsis class="h-5 w-5" :stroke-width="moreActive || showMore ? 2.6 : 2" /><span>Lainnya</span></button>
    </nav>
  </div>
</template>

<style scoped>
.mobile-sheet-enter-active,.mobile-sheet-leave-active{transition:opacity .18s ease,transform .18s ease}.mobile-sheet-enter-from,.mobile-sheet-leave-to{opacity:0;transform:translateY(12px)}
@media (prefers-reduced-motion:reduce){.mobile-sheet-enter-active,.mobile-sheet-leave-active{transition:none}}
</style>
