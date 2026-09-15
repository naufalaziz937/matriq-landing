<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Bell, CheckCheck, Award, BookOpen, Circle, ClipboardList, ShieldCheck } from 'lucide-vue-next';
import { useNotificationsStore } from '~/stores/api/notifications';
import { useAuthStore } from '~/stores/api/auth';

const store = useNotificationsStore();
const auth = useAuthStore();
const open = ref(false);
const root = ref<HTMLElement | null>(null);
const count = computed(() => store.unreadCount > 9 ? '9+' : String(store.unreadCount));
let timer: ReturnType<typeof setInterval> | undefined;
function outside(event: MouseEvent) { if (root.value && !root.value.contains(event.target as Node)) open.value = false; }
function timeAgo(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} jam lalu`;
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
function icon(type: string) { if (type === 'achievement_unlocked') return Award; if (type.includes('material')) return BookOpen; if (type.includes('question')) return ClipboardList; return ShieldCheck; }
async function select(item: any) {
  if (!item.is_read && !(await store.markAsRead(item.notification_id))) return;
  open.value = false;
  if (item.action_url?.startsWith('/') && !item.action_url.startsWith('//')) await navigateTo(item.action_url);
}
watch(() => auth.token, token => { if (token) store.fetchNotifications(); else store.reset(); }, { immediate: true });
onMounted(() => { timer = setInterval(() => { if (auth.token) store.fetchNotifications(); else store.reset(); }, 90000); document.addEventListener('click', outside); });
onUnmounted(() => { if (timer) clearInterval(timer); document.removeEventListener('click', outside); });
</script>

<template>
  <div ref="root" class="relative">
    <button type="button" class="relative rounded-full p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 focus:outline-none" aria-label="Buka notifikasi" :aria-expanded="open" @click="open = !open; if (open) store.fetchNotifications()">
      <Bell class="h-6 w-6" />
      <span v-if="store.unreadCount > 0" class="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-0.5 text-[10px] font-bold text-white ring-2 ring-white">{{ count }}</span>
    </button>
    <div v-if="open" class="fixed left-4 right-4 top-20 z-50 mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:w-80">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 class="text-sm font-bold text-slate-900">Notifikasi</h4>
        <button v-if="store.unreadCount" type="button" class="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline" @click="store.markAllAsRead()"><CheckCheck class="h-3.5 w-3.5" /> Tandai semua dibaca</button>
      </div>
      <div class="mt-3 max-h-64 space-y-1 overflow-y-auto">
        <div v-if="store.isLoading && !store.notifications.length" class="space-y-2"><div v-for="n in 3" :key="n" class="h-16 animate-pulse rounded-xl bg-slate-100" /></div>
        <div v-else-if="store.error" class="py-5 text-center text-xs text-red-600">{{ store.error }} <button class="ml-1 font-bold underline" @click="store.fetchNotifications()">Coba Lagi</button></div>
        <div v-else-if="!store.notifications.length" class="py-5 text-center"><p class="text-xs font-bold text-slate-700">Belum ada notifikasi</p><p class="mt-1 text-[11px] text-slate-500">Aktivitas dan pembaruan terbaru akan muncul di sini.</p></div>
        <button v-for="item in store.notifications" :key="item.notification_id" type="button" class="flex w-full gap-2 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-50" :class="item.is_read ? '' : 'bg-blue-50/70'" @click="select(item)">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><component :is="icon(item.type)" class="h-4 w-4" /></span>
          <span class="min-w-0 flex-1 text-xs"><span class="flex items-center gap-1 font-bold text-slate-800"><Circle v-if="!item.is_read" class="h-2 w-2 fill-blue-600 text-blue-600" />{{ item.title }}</span><span class="mt-0.5 block text-[11px] leading-snug text-slate-500">{{ item.message }}</span><span class="mt-1 block text-[10px] text-slate-400">{{ timeAgo(item.created_at) }}</span></span>
        </button>
      </div>
    </div>
  </div>
</template>
