import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useUserAchievementsStore = defineStore('userAchievements', {
  state: () => ({ summary: null, achievements: [], latestAchievements: [], almostUnlocked: [], filters: { category: '', status: 'all', rarity: '' }, isLoading: false, error: '' }),
  actions: {
    async fetchAchievements() {
      this.isLoading = true; this.error = '';
      try { const auth = useAuthStore(); const { data } = await $fetch('/user/achievements', { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` }, query: this.filters }); this.summary = data.summary; this.achievements = data.achievements || []; this.latestAchievements = data.latest || []; this.almostUnlocked = data.almost_unlocked || []; return data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat achievement.'; return null; }
      finally { this.isLoading = false; }
    },
    setCategory(category) { this.filters.category = category; return this.fetchAchievements(); },
    setStatus(status) { this.filters.status = status; return this.fetchAchievements(); },
    setRarity(rarity) { this.filters.rarity = rarity; return this.fetchAchievements(); },
    refreshAchievements() { return this.fetchAchievements(); },
  },
});
