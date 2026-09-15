import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useUserStudyPlanStore = defineStore('userStudyPlan', {
  state: () => ({ plans: [], selectedDate: '', dailyAgenda: [], weekSummary: null, recommendations: null, generatedPlan: null, calendarView: 'month', filters: { type: '' }, isLoading: false, isSaving: false, isGenerating: false, error: '' }),
  actions: {
    request(path, options = {}) {
      const auth = useAuthStore();
      return $fetch(`/user/study-plan${path}`, { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    async fetchPlans(from, to) {
      this.isLoading = true; this.error = '';
      try { const result = await this.request('', { query: { date_from: from, date_to: to, view: this.calendarView } }); this.plans = result.data || []; return this.plans; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat Study Plan.'; this.plans = []; return []; }
      finally { this.isLoading = false; }
    },
    async fetchDayAgenda(date) {
      this.selectedDate = date;
      try { const result = await this.request('/day', { query: { date } }); this.dailyAgenda = result.data || []; return this.dailyAgenda; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat agenda harian.'; this.dailyAgenda = []; return []; }
    },
    async fetchWeekSummary(weekStart) {
      try { const result = await this.request('/week-summary', { query: { week_start: weekStart } }); this.weekSummary = result.data; return result.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat ringkasan minggu.'; return null; }
    },
    async fetchRecommendations() {
      try { const result = await this.request('/recommendations'); this.recommendations = result.data; return result.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat rekomendasi.'; return null; }
    },
    async mutate(path, method, body) {
      this.isSaving = true; this.error = '';
      try { const result = await this.request(path, { method, ...(body ? { body } : {}) }); return result.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal menyimpan jadwal.'; return null; }
      finally { this.isSaving = false; }
    },
    createPlan(payload) { return this.mutate('', 'POST', payload); },
    updatePlan(id, payload) { return this.mutate(`/${id}`, 'PUT', payload); },
    deletePlan(id) { return this.mutate(`/${id}`, 'DELETE'); },
    completePlan(id) { return this.mutate(`/${id}/complete`, 'PUT'); },
    async generatePlan(payload) {
      this.isGenerating = true; this.error = '';
      try { const result = await this.request('/generate', { method: 'POST', body: payload }); this.generatedPlan = result.data; return result.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal membuat pratinjau rencana.'; return null; }
      finally { this.isGenerating = false; }
    },
    async saveGeneratedPlan() { const result = await this.mutate('/generate/save', 'POST', { plans: this.generatedPlan?.plans || [] }); if (result) this.generatedPlan = null; return result; },
  },
});
