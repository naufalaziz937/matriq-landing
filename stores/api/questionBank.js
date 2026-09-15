import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useQuestionBankStore = defineStore('questionBank', {
  state: () => ({
    questions: [],
    selectedQuestion: null,
    summary: { total: null, active: null, draft: null, review: null },
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    filters: { search: '', subtest: '', difficulty: '', status: '', category: '' },
    categories: [],
    isLoading: false,
    isSubmitting: false,
    error: '',
    summaryAvailable: false,
    requestId: 0,
  }),
  actions: {
    async request(path, options = {}) {
      const auth = useAuthStore();
      const apiBase = useRuntimeConfig().public.apiBase || 'http://localhost:4000/api';
      return $fetch(path, {
        baseURL: apiBase,
        headers: { Authorization: `Bearer ${auth.token}` },
        ...options,
      });
    },
    async fetchQuestions() {
      const currentRequest = ++this.requestId;
      this.isLoading = true;
      this.error = '';
      try {
        const response = await this.request('/admin/questions', {
          query: {
            page: this.pagination.page,
            limit: this.pagination.limit,
            ...Object.fromEntries(Object.entries(this.filters).filter(([, value]) => String(value).trim())),
          },
        });
        if (currentRequest !== this.requestId) return;
        const data = response?.data ?? response;
        this.questions = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : [];
        const pagination = response?.pagination ?? data?.pagination ?? {};
        this.pagination.total = Number(pagination.total ?? this.questions.length);
        this.pagination.totalPages = Math.max(1, Number(pagination.total_pages ?? pagination.totalPages ?? Math.ceil(this.pagination.total / this.pagination.limit)));
        if (Array.isArray(response?.categories)) this.categories = response.categories;
      } catch (error) {
        if (currentRequest !== this.requestId) return;
        this.questions = [];
        this.pagination.total = 0;
        this.pagination.totalPages = 1;
        this.error = error?.data?.message || 'Gagal memuat Bank Soal';
      } finally {
        if (currentRequest === this.requestId) this.isLoading = false;
      }
    },
    async fetchSummary() {
      try {
        const response = await this.request('/admin/questions/summary');
        const data = response?.data ?? response;
        this.summary = {
          total: data?.total ?? data?.total_questions ?? null,
          active: data?.active ?? data?.active_questions ?? null,
          draft: data?.draft ?? data?.draft_questions ?? null,
          review: data?.review ?? data?.review_questions ?? null,
        };
        this.summaryAvailable = true;
      } catch {
        this.summaryAvailable = false;
        this.summary = { total: null, active: null, draft: null, review: null };
      }
    },
    async fetchQuestionById(id) {
      this.selectedQuestion = null;
      const response = await this.request(`/admin/questions/${encodeURIComponent(id)}`);
      this.selectedQuestion = response?.data ?? response;
      return this.selectedQuestion;
    },
    async submit(method, path, body) {
      this.isSubmitting = true;
      this.error = '';
      try {
        return await this.request(path, { method, body });
      } catch (error) {
        this.error = error?.data?.message || error?.message || 'Gagal menyimpan soal';
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
    createQuestion(payload) { return this.submit('POST', '/admin/questions', payload); },
    updateQuestion(id, payload) { return this.submit('PUT', `/admin/questions/${encodeURIComponent(id)}`, payload); },
    deleteQuestion(id) { return this.submit('DELETE', `/admin/questions/${encodeURIComponent(id)}`); },
  },
});
