import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useUserAnalyticsStore = defineStore('userAnalytics', {
  state: () => ({ analytics: null, overview: null, activityTrend: [], practice: null, subtests: [], difficultyLevels: [], tryout: null, target: null, studyConsistency: [], studyPlan: null, studyTime: null, materials: [], strength: null, weakness: null, insights: [], recommendedFocus: null, range: '30d', dateFrom: '', dateTo: '', isLoading: false, error: '' }),
  actions: {
    async fetchAnalytics() {
      this.isLoading = true; this.error = '';
      try {
        const auth = useAuthStore();
        const { data } = await $fetch('/user/analytics', { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` }, query: { range: this.range, ...(this.dateFrom && this.dateTo ? { date_from: this.dateFrom, date_to: this.dateTo } : {}) } });
        this.analytics = data; this.overview = data.overview; this.activityTrend = data.activity_trend || []; this.practice = data.practice; this.subtests = data.subtests || []; this.difficultyLevels = data.difficulty_levels || []; this.tryout = data.tryout; this.target = data.target; this.studyConsistency = data.study_consistency || []; this.studyPlan = data.study_plan; this.studyTime = data.study_time; this.materials = data.materials || []; this.strength = data.strength; this.weakness = data.weakness; this.insights = data.insights || []; this.recommendedFocus = data.recommended_focus; return data;
      } catch (error) { this.error = error?.data?.message || 'Gagal memuat Analytics.'; return null; }
      finally { this.isLoading = false; }
    },
    setRange(range) { this.range = range; this.dateFrom = ''; this.dateTo = ''; return this.fetchAnalytics(); },
    refreshAnalytics() { return this.fetchAnalytics(); },
  },
});
