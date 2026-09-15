import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({ notifications: [], unreadCount: 0, isLoading: false, error: '' }),
  actions: {
    reset() { this.notifications = []; this.unreadCount = 0; this.error = ''; },
    async fetchNotifications() {
      const auth = useAuthStore();
      if (!auth.token) { this.reset(); return; }
      this.isLoading = true; this.error = '';
      try {
        const response = await $fetch('/notifications', { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` } });
        this.notifications = response.data?.notifications || [];
        this.unreadCount = Number(response.data?.unread_count || 0);
      } catch (error) { this.error = error?.data?.message || 'Gagal memuat notifikasi.'; }
      finally { this.isLoading = false; }
    },
    async markAsRead(id) {
      const auth = useAuthStore();
      try {
        const response = await $fetch(`/notifications/${id}/read`, { method: 'PUT', baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` } });
        const index = this.notifications.findIndex(item => item.notification_id === id);
        if (index >= 0 && !this.notifications[index].is_read) { this.notifications[index] = response.data; this.unreadCount = Math.max(0, this.unreadCount - 1); }
        return true;
      } catch (error) { this.error = error?.data?.message || 'Gagal menandai notifikasi.'; return false; }
    },
    async markAllAsRead() {
      const auth = useAuthStore();
      try {
        await $fetch('/notifications/read-all', { method: 'PUT', baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` } });
        const now = new Date().toISOString();
        this.notifications = this.notifications.map(item => ({ ...item, is_read: true, read_at: item.read_at || now }));
        this.unreadCount = 0;
      } catch (error) { this.error = error?.data?.message || 'Gagal menandai notifikasi.'; }
    },
  },
});
