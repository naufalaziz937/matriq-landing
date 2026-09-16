<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
  Headset,
  X,
  CircleAlert,
  Instagram,
  MessageCircle,
} from "lucide-vue-next";
import { useSupportSettingsStore } from "~/stores/api/supportSettings";
import { contactConfig } from "~/config/contact";

const store = useSupportSettingsStore();
const config = useRuntimeConfig();
const route = useRoute();
const isOpen = ref(false);
const root = ref<HTMLElement | null>(null);
const notice = ref("");
const whatsapp = computed(
  () => store.whatsapp || config.public.supportWhatsapp || contactConfig.whatsapp.phone,
);
const instagram = computed(
  () => store.instagram || config.public.supportInstagram || contactConfig.instagram.username || contactConfig.instagram.url,
);
const whatsappUrl = computed(() => {
  const number = String(whatsapp.value).replace(/[^0-9]/g, "");
  if (number.length < 8 || number.length > 15) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(contactConfig.whatsapp.message)}`;
});
const instagramUrl = computed(() => {
  const source = String(instagram.value).trim();
  if (/^[a-zA-Z0-9._]{1,30}$/.test(source))
    return `https://www.instagram.com/${source}/`;
  try {
    const url = new URL(source);
    if (
      url.protocol === "https:" &&
      ["instagram.com", "www.instagram.com"].includes(url.hostname) &&
      /^\/[a-zA-Z0-9._]{1,30}\/?$/.test(url.pathname)
    )
      return url.href;
  } catch {
    /* Invalid configuration is treated as unavailable. */
  }
  return "";
});
function external(url: string, label: string) {
  if (!url) {
    notice.value = `${label} belum tersedia. Silakan coba lagi nanti.`;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
  isOpen.value = false;
  notice.value = "";
}
async function openInfo() {
  isOpen.value = false;
  notice.value = "";
  await navigateTo('/about');
}
function outside(event: MouseEvent) {
  if (
    root.value &&
    !root.value.contains(event.target as Node)
  )
    isOpen.value = false;
}
function keydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    isOpen.value = false;
  }
}
watch(
  () => route.fullPath,
  () => {
    isOpen.value = false;
    notice.value = "";
  },
);
onMounted(() => {
  store.fetchOnce();
  document.addEventListener("click", outside);
  document.addEventListener("keydown", keydown);
});
onUnmounted(() => {
  document.removeEventListener("click", outside);
  document.removeEventListener("keydown", keydown);
});
</script>

<template>
  <div
    ref="root"
    class="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] right-5 z-[44] flex flex-col items-end gap-3 lg:bottom-6 lg:right-6 lg:z-40"
    aria-label="Bantuan MatrIQ"
  >
    <Transition name="support-actions">
      <div v-if="isOpen" class="flex flex-col items-end gap-2.5">
        <button
          type="button"
          aria-label="Hubungi MatrIQ melalui WhatsApp"
          title="WhatsApp"
          class="group flex items-center gap-2"
          @click.stop="external(whatsappUrl, 'WhatsApp')"
        >
          <span
            class="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
            >WhatsApp</span
          ><span
            class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform group-hover:scale-105 group-active:scale-95"
            ><MessageCircle class="h-5 w-5"
          /></span>
        </button>
        <button
          type="button"
          aria-label="Buka Instagram MatrIQ"
          title="Instagram"
          class="group flex items-center gap-2"
          @click.stop="external(instagramUrl, 'Instagram')"
        >
          <span
            class="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
            >Instagram</span
          ><span
            class="flex h-12 w-12 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg transition-transform group-hover:scale-105 group-active:scale-95"
            ><Instagram class="h-5 w-5"
          /></span>
        </button>
        <button
          type="button"
          aria-label="Tentang MatrIQ"
          title="Tentang MatrIQ"
          class="group flex items-center gap-2"
          @click.stop="openInfo"
        >
          <span
            class="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
            >Tentang MatrIQ</span
          ><span
            class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition-transform group-hover:scale-105 group-active:scale-95"
            ><CircleAlert class="h-5 w-5"
          /></span>
        </button>
      </div>
    </Transition>
    <p
      v-if="notice"
      role="status"
      class="max-w-60 rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
    >
      {{ notice }}
    </p>
    <button
      type="button"
      :aria-label="isOpen ? 'Tutup menu bantuan' : 'Buka menu bantuan'"
      :aria-expanded="isOpen"
      title="Bantuan MatrIQ"
      class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 md:h-14 md:w-14"
      @click.stop="
        isOpen = !isOpen;
        notice = '';
      "
    >
      <X v-if="isOpen" class="h-6 w-6 rotate-90" /><Headset
        v-else
        class="h-6 w-6"
      />
    </button>
  </div>
</template>

<style scoped>
.support-actions-enter-active,
.support-actions-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.support-actions-enter-from,
.support-actions-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.94);
}
.support-actions-enter-active .group:nth-child(1) { animation: support-action-in .2s ease .08s both; }
.support-actions-enter-active .group:nth-child(2) { animation: support-action-in .2s ease .04s both; }
.support-actions-enter-active .group:nth-child(3) { animation: support-action-in .2s ease both; }
@keyframes support-action-in { from { opacity: 0; transform: translateY(10px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (prefers-reduced-motion: reduce) {
  .support-actions-enter-active,
  .support-actions-leave-active {
    transition: none;
  }
}
</style>
