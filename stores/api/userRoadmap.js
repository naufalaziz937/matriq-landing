import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useUserRoadmapStore = defineStore('userRoadmap', {
  state: () => ({
    roadmap: null, target: null, countdown: null, readiness: null, stages: [],
    currentStage: null, subtests: [], recommendation: null, tip: null,
    milestones: [], tryout: null, performance: [], isLoading: false, error: '',
  }),
  actions: {
    async fetchRoadmap() {
      this.isLoading = true;
      this.error = '';
      try {
        const auth = useAuthStore();
        const response = await $fetch('/user/roadmap', {
          baseURL: useRuntimeConfig().public.apiBase,
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const data = response.data;
        this.roadmap = data;
        this.target = data.target;
        this.countdown = data.countdown;
        this.readiness = data.readiness;
        this.stages = data.stages || [];
        this.currentStage = data.current_stage;
        this.subtests = data.subtests || [];
        this.recommendation = data.daily_recommendation;
        this.tip = data.tip;
        this.milestones = data.milestones || [];
        this.tryout = data.tryout;
        this.performance = data.subtest_performance || [];
        return data;
      } catch (error) {
        this.error = error?.data?.message || 'Gagal memuat roadmap belajarmu.';
        this.roadmap = null;
        return null;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
