import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useUserTryoutRecapStore = defineStore('userTryoutRecap', {
  state: () => ({ summary: null, target: null, scoreTrend: [], subtestPerformance: [], platformUsage: [], recaps: [], recentRecaps: [], selectedRecap: null, insights: [], pagination: { page: 1, total: 0, total_pages: 1 }, filters: { platform: '', date_from: '', date_to: '', sort: 'newest' }, isLoading: false, isSaving: false, error: '' }),
  actions: {
    request(path = '', options = {}) {
      const auth = useAuthStore();
      return $fetch(`/user/tryout-recap${path}`, { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    async fetchOverview() {
      this.isLoading = true; this.error = '';
      try { const { data } = await this.request(); this.summary = data.summary; this.target = data.target; this.scoreTrend = data.score_trend || []; this.subtestPerformance = data.subtests || []; this.platformUsage = data.platform_usage || []; this.recentRecaps = data.recent_recaps || []; this.insights = data.insights || []; return data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat rekap tryout.'; return null; }
      finally { this.isLoading = false; }
    },
    async fetchHistory(page = 1) {
      try { const { data } = await this.request('/history', { query: { ...this.filters, page, limit: 10 } }); this.recaps = data.recaps || []; this.pagination = data.pagination; return data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat riwayat rekap.'; return null; }
    },
    async fetchDetail(id) {
      this.isLoading = true; this.error = '';
      try { const { data } = await this.request(`/${encodeURIComponent(id)}`); this.selectedRecap = data; return data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat detail rekap.'; return null; }
      finally { this.isLoading = false; }
    },
    async save(action) {
      this.isSaving = true; this.error = '';
      try { return await action(); }
      catch (error) { this.error = error?.data?.message || 'Gagal menyimpan rekap tryout.'; return null; }
      finally { this.isSaving = false; }
    },
    createRecap(body) { return this.save(async () => (await this.request('', { method: 'POST', body })).data); },
    updateRecap(id, body) { return this.save(async () => (await this.request(`/${encodeURIComponent(id)}`, { method: 'PUT', body })).data); },
    deleteRecap(id) { return this.save(async () => (await this.request(`/${encodeURIComponent(id)}`, { method: 'DELETE' })).data); },
  },
});
