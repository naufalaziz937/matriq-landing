import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useAdminTryoutRecapStore = defineStore('adminTryoutRecap', {
  state: () => ({
    summary: null, recaps: [], ranking: [], platformStats: [], subtestStats: null,
    distribution: [], mostImproved: [], selectedUser: null,
    filters: { search: '', platform: '', campus_id: '', prodi_code: '', date_from: '', date_to: '', sort: 'latest' },
    pagination: { page: 1, limit: 10, total: 0, total_pages: 1 },
    isLoading: false, isLoadingUser: false, error: '', userError: '',
  }),
  actions: {
    request(path, options = {}) {
      const auth = useAuthStore();
      return $fetch(path, { baseURL: useRuntimeConfig().public.apiBase,
        headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    activeFilters() { return Object.fromEntries(Object.entries(this.filters).filter(([, value]) => value !== '' && value != null)); },
    async fetchSummary() { this.summary = (await this.request('/admin/tryout-recap/summary')).data; },
    async fetchRecaps() {
      const result = await this.request('/admin/tryout-recap', { query: { ...this.activeFilters(), page: this.pagination.page, limit: this.pagination.limit } });
      this.recaps = result.data || []; this.pagination = result.pagination || this.pagination;
    },
    async fetchRanking() { this.ranking = (await this.request('/admin/tryout-recap/ranking', { query: { campus_id: this.filters.campus_id || undefined, prodi_code: this.filters.prodi_code || undefined, limit: 10 } })).data || []; },
    async fetchPlatformStats() { this.platformStats = (await this.request('/admin/tryout-recap/platforms')).data || []; },
    async fetchSubtestStats() { this.subtestStats = (await this.request('/admin/tryout-recap/subtests')).data; },
    async fetchDistribution() { this.distribution = (await this.request('/admin/tryout-recap/distribution')).data || []; },
    async fetchMostImproved() { this.mostImproved = (await this.request('/admin/tryout-recap/most-improved')).data || []; },
    async fetchUserDetail(id) {
      this.isLoadingUser = true; this.userError = ''; this.selectedUser = null;
      try { this.selectedUser = (await this.request(`/admin/tryout-recap/user/${id}`)).data; }
      catch (error) { this.userError = error?.data?.message || 'Gagal memuat perkembangan user.'; }
      finally { this.isLoadingUser = false; }
    },
    async fetchAll() {
      this.isLoading = true; this.error = '';
      try { await Promise.all([this.fetchSummary(), this.fetchRecaps(), this.fetchRanking(), this.fetchPlatformStats(), this.fetchSubtestStats(), this.fetchDistribution(), this.fetchMostImproved()]); }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat data rekap tryout.'; }
      finally { this.isLoading = false; }
    },
  },
});
