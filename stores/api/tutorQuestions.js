import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useTutorQuestionsStore = defineStore('tutorQuestions', {
  state: () => ({ items: [], selectedItem: null, summary: { total: null, review: null, active: null, rejected: null }, pagination: { page: 1, limit: 10, total: 0, total_pages: 1 }, loading: false, saving: false, error: '' }),
  actions: {
    request(path, options = {}) {
      const auth = useAuthStore();
      return $fetch(path, { baseURL: useRuntimeConfig().public.apiBase,
        headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    async fetchSummary() { this.summary = (await this.request('/tutor/questions/summary')).data; },
    async fetchItems() {
      this.loading = true; this.error = '';
      try { const response = await this.request('/tutor/questions', { query: { page: this.pagination.page, limit: this.pagination.limit } });
        this.items = response.data || []; this.pagination = response.pagination || this.pagination;
      } catch (error) { this.error = error?.data?.message || 'Gagal memuat soal.'; this.items = []; }
      finally { this.loading = false; }
    },
    async fetchItem(id) { this.selectedItem = (await this.request(`/tutor/questions/${id}`)).data; return this.selectedItem; },
    async save(id, payload) {
      this.saving = true;
      try { return await this.request(id ? `/tutor/questions/${id}` : '/tutor/questions', { method: id ? 'PUT' : 'POST', body: payload }); }
      finally { this.saving = false; }
    },
    async submit(id) {
      this.saving = true;
      try { return await this.request(`/tutor/questions/${id}/submit`, { method: 'PUT' }); }
      finally { this.saving = false; }
    },
    async remove(id) { return this.request(`/tutor/questions/${id}`,{method:'DELETE'}); },
  },
});
