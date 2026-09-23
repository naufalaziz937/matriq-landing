import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useUserPracticeStore = defineStore('userPractice', {
  state: () => ({ summary: null, subtests: [], selectedSubtest: null, materials: [], selectedMaterial: null, levels: [], recommendation: null, recentSessions: [], currentSession: null, currentQuestionIndex: 0, feedbackByQuestion: {}, sessionResult: null, isLoading: false, isStarting: false, isAnswering: false, isCompleting: false, error: '' }),
  actions: {
    request(path = '', options = {}) {
      const auth = useAuthStore();
      return $fetch(`/user/practice${path}`, { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    async fetchPracticeOverview() {
      this.isLoading = true; this.error = '';
      try { const response = await this.request(); const data = response.data; this.summary = data.summary; this.subtests = data.subtests || []; this.recommendation = data.recommendation; this.recentSessions = data.recent_sessions || []; return data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat latihan.'; return null; }
      finally { this.isLoading = false; }
    },
    async fetchMaterials(code) {
      this.selectedSubtest = code; this.selectedMaterial = null; this.materials = []; this.levels = []; this.error = '';
      try { const response = await this.request(`/subtests/${encodeURIComponent(code)}/materials`); this.materials = response.data || []; return this.materials; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat materi latihan.'; return []; }
    },
    async fetchLevels(id) {
      this.selectedMaterial = this.materials.find(item => item.id === Number(id)) || null; this.levels = []; this.error = '';
      try { const response = await this.request(`/materials/${encodeURIComponent(id)}/levels`); this.levels = response.data.levels || []; return response.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat level latihan.'; return null; }
    },
    async startSession(materialId, level, count) {
      this.isStarting = true; this.error = '';
      try { const response = await this.request('/session', { method: 'POST', body: { material_id: materialId, subtest: this.selectedSubtest, difficulty_level: level, question_count: count } }); this.currentSession = response.data; this.currentQuestionIndex = 0; this.feedbackByQuestion = {}; this.sessionResult = null; return response.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memulai latihan.'; return null; }
      finally { this.isStarting = false; }
    },
    async fetchSession(id) {
      this.isLoading = true; this.error = '';
      try { const response = await this.request(`/session/${encodeURIComponent(id)}`); this.currentSession = response.data; this.feedbackByQuestion = Object.fromEntries((response.data.questions || []).filter(item => item.feedback).map(item => [item.question_id, item.feedback])); return response.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat sesi latihan.'; return null; }
      finally { this.isLoading = false; }
    },
    async submitAnswer(sessionId, questionId, selectedAnswer, seconds) {
      this.isAnswering = true; this.error = '';
      try { const response = await this.request(`/session/${encodeURIComponent(sessionId)}/answer`, { method: 'POST', body: { question_id: questionId, selected_answer: selectedAnswer, time_spent_seconds: seconds } }); this.feedbackByQuestion[questionId] = response.data; return response.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal menyimpan jawaban.'; return null; }
      finally { this.isAnswering = false; }
    },
    async completeSession(id) {
      this.isCompleting = true; this.error = '';
      try { const response = await this.request(`/session/${encodeURIComponent(id)}/complete`, { method: 'PUT' }); this.sessionResult = response.data; if (this.currentSession) this.currentSession.status = 'completed'; return response.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal menyelesaikan latihan.'; return null; }
      finally { this.isCompleting = false; }
    },
    async fetchSessionResult(id) {
      this.isLoading = true; this.error = '';
      try { const response = await this.request(`/session/${encodeURIComponent(id)}/result`); this.sessionResult = response.data; return response.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat hasil latihan.'; return null; }
      finally { this.isLoading = false; }
    },
  },
});
