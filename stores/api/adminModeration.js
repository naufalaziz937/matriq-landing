import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useAdminModerationStore = defineStore('adminModeration', {
  state: () => ({
    summary: { pending_review: null, approved_today: null, rejected: null, total_tutor_submission: null },
    items: [], selectedItem: null,
    pagination: { page: 1, limit: 10, total: 0, total_pages: 1 },
    filters: { search: '', status: 'review', subtest: '', difficulty: '', tutor_id: '', date_from: '', date_to: '', sort: 'oldest' },
    isLoading: false, isLoadingDetail: false, isReviewing: false, error: '', detailError: '', requestId: 0,
  }),
  actions: {
    request(path, options = {}) {
      const auth = useAuthStore();
      return $fetch(path, { baseURL: useRuntimeConfig().public.apiBase,
        headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    async fetchSummary() { this.summary = (await this.request('/admin/moderation/summary')).data; },
    async fetchModerationQueue() {
      const id = ++this.requestId; this.isLoading = true; this.error = '';
      try {
        const query = { ...Object.fromEntries(Object.entries(this.filters).filter(([, value]) => value !== '')), page: this.pagination.page, limit: this.pagination.limit };
        const response = await this.request('/admin/moderation', { query });
        if (id !== this.requestId) return;
        this.items = response.data || []; this.pagination = response.pagination || this.pagination;
      } catch (error) { if (id === this.requestId) { this.items = []; this.error = error?.data?.message || 'Gagal memuat moderation queue.'; } }
      finally { if (id === this.requestId) this.isLoading = false; }
    },
    async fetchModerationDetail(id) {
      this.selectedItem = null; this.detailError = ''; this.isLoadingDetail = true;
      try { this.selectedItem = (await this.request(`/admin/moderation/${id}`)).data; }
      catch (error) { this.detailError = error?.data?.message || 'Gagal memuat detail soal.'; }
      finally { this.isLoadingDetail = false; }
    },
    async review(id, action, body) {
      this.isReviewing = true;
      try {
        const response = await this.request(`/admin/moderation/${id}/${action}`, { method: 'PUT', body });
        if (this.filters.status === 'review') this.items = this.items.filter(item => item.id !== id);
        else this.items = this.items.map(item => item.id === id ? { ...item, ...response.data } : item);
        this.pagination.total = Math.max(0, this.pagination.total - (this.filters.status === 'review' ? 1 : 0));
        await this.fetchSummary().catch(() => {});
        return response;
      } finally { this.isReviewing = false; }
    },
    approveQuestion(id) { return this.review(id, 'approve'); },
    rejectQuestion(id, reason) { return this.review(id, 'reject', { reason }); },
  },
});
