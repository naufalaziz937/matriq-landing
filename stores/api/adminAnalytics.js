import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

const endpoints = {
  overview: 'overview', userGrowth: 'user-growth', activeTrend: 'active-trend',
  roleDistribution: 'role-distribution', geography: 'geography', campusTargets: 'campus-targets',
  programTargets: 'program-targets', tryoutTrend: 'tryout-trend', scoreDistribution: 'score-distribution',
  subtests: 'subtests', studyProgress: 'study-progress', studyTime: 'study-time',
  accuracyDistribution: 'accuracy-distribution', activityHeatmap: 'activity-heatmap',
  platformStats: 'platforms', leaderboard: 'leaderboard', mostImproved: 'most-improved',
  funnel: 'funnel', recentActivity: 'recent-activity', insights: 'insights',
};

export const useAdminAnalyticsStore = defineStore('adminAnalytics', {
  state: () => ({
    ...Object.fromEntries(Object.keys(endpoints).map(key => [key, null])),
    filters: { period: '30d', date_from: '', date_to: '', role: '', province: '', campus_id: '', prodi_code: '' },
    loading: false, error: '', widgetErrors: {}, requestId: 0,
  }),
  actions: {
    query() { return Object.fromEntries(Object.entries(this.filters).filter(([, value]) => value !== '' && value != null)); },
    request(path, options = {}) {
      const auth = useAuthStore();
      return $fetch(path, { baseURL: useRuntimeConfig().public.apiBase,
        headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    async fetchEndpoint(key, query = this.query()) {
      const response = await this.request(`/admin/analytics/${endpoints[key]}`, { query });
      this[key] = response.data;
      return response.data;
    },
    async fetchAllAnalytics() {
      const id = ++this.requestId;
      const query = this.query(); this.loading = true; this.error = ''; this.widgetErrors = {};
      const results = await Promise.allSettled(Object.keys(endpoints).map(async key => {
        const response = await this.request(`/admin/analytics/${endpoints[key]}`, { query });
        return { key, data: response.data };
      }));
      if (id !== this.requestId) return;
      results.forEach((result, index) => {
        const key = Object.keys(endpoints)[index];
        if (result.status === 'fulfilled') this[key] = result.value.data;
        else { this[key] = null; this.widgetErrors[key] = result.reason?.data?.message || 'Gagal memuat data.'; }
      });
      if (this.widgetErrors.overview) this.error = 'Gagal memuat ringkasan analytics.';
      this.loading = false;
    },
  },
});
