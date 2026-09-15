<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Headset, X, CircleAlert, Instagram, ExternalLink, MessageCircle } from 'lucide-vue-next';
import { useSupportSettingsStore } from '~/stores/api/supportSettings';

const store = useSupportSettingsStore();
const config = useRuntimeConfig();
const route = useRoute();
const isOpen = ref(false);
const showInfo = ref(false);
const root = ref<HTMLElement | null>(null);
const notice = ref('');
const whatsapp = computed(() => store.whatsapp || config.public.supportWhatsapp || '');
const instagram = computed(() => store.instagram || config.public.supportInstagram || '');
const whatsappUrl = computed(() => {
  const number = String(whatsapp.value).replace(/[^0-9]/g, '');
  if (number.length < 8 || number.length > 15) return '';
  return `https://wa.me/${number}?text=${encodeURIComponent('Halo MatrIQ, saya butuh bantuan.')}`;
});
const instagramUrl = computed(() => {
  const source = String(instagram.value).trim();
  if (/^[a-zA-Z0-9._]{1,30}$/.test(source)) return `https://www.instagram.com/${source}/`;
  try {
    const url = new URL(source);
    if (url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname) && /^\/[a-zA-Z0-9._]{1,30}\/?$/.test(url.pathname)) return url.href;
  } catch { /* Invalid configuration is treated as unavailable. */ }
  return '';
});
function external(url: string, label: string) {
  if (!url) { notice.value = `${label} belum tersedia. Silakan coba lagi nanti.`; return; }
  window.open(url, '_blank', 'noopener,noreferrer');
  isOpen.value = false;
  notice.value = '';
}
function openInfo() { isOpen.value = false; showInfo.value = true; notice.value = ''; }
function outside(event: MouseEvent) { if (!showInfo.value && root.value && !root.value.contains(event.target as Node)) isOpen.value = false; }
function keydown(event: KeyboardEvent) { if (event.key === 'Escape') { if (showInfo.value) showInfo.value = false; else isOpen.value = false; } }
watch(() => route.fullPath, () => { isOpen.value = false; notice.value = ''; });
onMounted(() => { store.fetchOnce(); document.addEventListener('click', outside); document.addEventListener('keydown', keydown); });
onUnmounted(() => { document.removeEventListener('click', outside); document.removeEventListener('keydown', keydown); });
</script>

<template>
  <div ref="root" class="fixed bottom-[calc(20px+env(safe-area-inset-bottom))] right-5 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6" aria-label="Bantuan MatrIQ">
    <Transition name="support-actions">
      <div v-if="isOpen" class="flex flex-col items-end gap-2.5">
        <button type="button" aria-label="Hubungi MatrIQ melalui WhatsApp" title="WhatsApp" class="group flex items-center gap-2" @click="external(whatsappUrl, 'WhatsApp')"><span class="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">WhatsApp</span><span class="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform group-hover:scale-105"><MessageCircle class="h-5 w-5" /></span></button>
        <button type="button" aria-label="Buka Instagram MatrIQ" title="Instagram" class="group flex items-center gap-2" @click="external(instagramUrl, 'Instagram')"><span class="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">Instagram</span><span class="flex h-11 w-11 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg transition-transform group-hover:scale-105"><Instagram class="h-5 w-5" /></span></button>
        <button type="button" aria-label="Tentang MatrIQ" title="Tentang MatrIQ" class="group flex items-center gap-2" @click="openInfo"><span class="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">Tentang MatrIQ</span><span class="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition-transform group-hover:scale-105"><CircleAlert class="h-5 w-5" /></span></button>
      </div>
    </Transition>
    <p v-if="notice" role="status" class="max-w-60 rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">{{ notice }}</p>
    <button type="button" :aria-label="isOpen ? 'Tutup menu bantuan' : 'Buka menu bantuan'" :aria-expanded="isOpen" title="Bantuan MatrIQ" class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 md:h-14 md:w-14" @click="isOpen = !isOpen; notice = ''"><X v-if="isOpen" class="h-6 w-6 rotate-90" /><Headset v-else class="h-6 w-6" /></button>
  </div>
  <Teleport to="body">
    <div v-if="showInfo" class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4" @click.self="showInfo = false">
      <div role="dialog" aria-modal="true" aria-labelledby="support-info-title" class="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-5 shadow-xl sm:p-6">
        <div class="flex items-start justify-between gap-3"><div class="flex items-center gap-2"><CircleAlert class="h-5 w-5 text-blue-600" /><h2 id="support-info-title" class="text-lg font-bold text-slate-900">Tentang MatrIQ</h2></div><button type="button" aria-label="Tutup info MatrIQ" class="rounded-lg p-1 text-slate-500 hover:bg-slate-100" @click="showInfo = false"><X class="h-5 w-5" /></button></div>
        <p class="mt-4 text-sm leading-relaxed text-slate-600">MatrIQ adalah platform pendamping belajar SNBT yang membantu siswa merencanakan belajar, berlatih soal, mencatat hasil tryout eksternal, memantau progres, dan mengevaluasi perkembangan menuju target kampus.</p>
        <div class="mt-4 rounded-xl bg-blue-50 p-3"><p class="text-xs font-bold text-blue-700">Fitur MatrIQ</p><p class="mt-1 text-xs leading-relaxed text-slate-600">Roadmap Belajar · Study Plan · Practice · Rekap Tryout · Analytics · Materi · Achievements</p></div>
        <p v-if="store.appVersion" class="mt-3 text-xs text-slate-500">Versi aplikasi {{ store.appVersion }}</p>
        <button type="button" class="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700" @click="showInfo = false">Tutup</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.support-actions-enter-active,.support-actions-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.support-actions-enter-from,.support-actions-leave-to { opacity: 0; transform: translateY(12px) scale(.94); }
@media (prefers-reduced-motion: reduce) { .support-actions-enter-active,.support-actions-leave-active { transition: none; } }
</style>
