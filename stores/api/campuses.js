import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useCampusesStore = defineStore('adminCampuses', {
  state: () => ({
    campuses: [], programs: [], provinces: [], selectedCampus: null,
    summary: { campuses: null, activeCampuses: null, programs: null, activePrograms: null },
    campusPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    programPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    campusFilters: { search: '', status: '' }, programFilters: { search: '', status: '' },
    isLoading: false, isLoadingPrograms: false, isSubmitting: false, error: '', programError: '',
    campusRequestId: 0, programRequestId: 0,
  }),
  actions: {
    request(path, options = {}) {
      const auth = useAuthStore();
      return $fetch(path, { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    async fetchSummary() {
      try { const response = await this.request('/admin/campuses/summary'); this.summary = response?.data ?? this.summary; }
      catch { this.summary = { campuses: null, activeCampuses: null, programs: null, activePrograms: null }; }
    },
    async fetchProvinces() {
      try { const response = await this.request('/wilayah/provinsi'); this.provinces = Array.isArray(response?.data) ? response.data : []; }
      catch { this.provinces = []; }
    },
    async fetchCampuses() {
      const current = ++this.campusRequestId;
      this.isLoading = true;
      this.error = '';
      try {
        const response = await this.request('/admin/campuses', {
          query: { page: this.campusPagination.page, limit: this.campusPagination.limit, ...Object.fromEntries(Object.entries(this.campusFilters).filter(([, value]) => String(value).trim())) },
        });
        if (current !== this.campusRequestId) return;
        this.campuses = Array.isArray(response?.data) ? response.data : [];
        this.campusPagination.total = Number(response?.pagination?.total ?? this.campuses.length);
        this.campusPagination.totalPages = Math.max(1, Number(response?.pagination?.total_pages ?? 1));
        if (this.selectedCampus) this.selectedCampus = this.campuses.find((item) => item.id === this.selectedCampus.id) ?? this.selectedCampus;
      } catch (error) {
        if (current !== this.campusRequestId) return;
        this.campuses = [];
        this.campusPagination.total = 0;
        this.campusPagination.totalPages = 1;
        this.error = error?.data?.message || 'Gagal memuat kampus';
      } finally { if (current === this.campusRequestId) this.isLoading = false; }
    },
    async fetchPrograms() {
      if (!this.selectedCampus) { this.programs = []; return; }
      const current = ++this.programRequestId;
      this.isLoadingPrograms = true;
      this.programError = '';
      const id = this.selectedCampus.id;
      try {
        const response = await this.request(`/admin/campuses/${id}/prodi`, {
          query: { page: this.programPagination.page, limit: this.programPagination.limit, ...Object.fromEntries(Object.entries(this.programFilters).filter(([, value]) => String(value).trim())) },
        });
        if (current !== this.programRequestId || this.selectedCampus?.id !== id) return;
        this.programs = Array.isArray(response?.data) ? response.data : [];
        this.programPagination.total = Number(response?.pagination?.total ?? this.programs.length);
        this.programPagination.totalPages = Math.max(1, Number(response?.pagination?.total_pages ?? 1));
      } catch (error) {
        if (current !== this.programRequestId) return;
        this.programs = [];
        this.programError = error?.data?.message || 'Gagal memuat prodi';
      } finally { if (current === this.programRequestId) this.isLoadingPrograms = false; }
    },
    selectCampus(campus) {
      this.selectedCampus = campus;
      this.programPagination.page = 1;
      this.programFilters = { search: '', status: '' };
      this.fetchPrograms();
    },
    async submit(path, method, body) {
      this.isSubmitting = true;
      try { return await this.request(path, { method, body }); }
      finally { this.isSubmitting = false; }
    },
    createCampus(body) { return this.submit('/admin/campuses', 'POST', body); },
    updateCampus(id, body) { return this.submit(`/admin/campuses/${id}`, 'PUT', body); },
    createProgram(id, body) { return this.submit(`/admin/campuses/${id}/prodi`, 'POST', body); },
    updateProgram(id, code, body) { return this.submit(`/admin/campuses/${id}/prodi/${encodeURIComponent(code)}`, 'PUT', body); },
  },
});
