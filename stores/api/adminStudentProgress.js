import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useAdminStudentProgressStore = defineStore('adminStudentProgress', {
  state: () => ({
    summary: null, students: [], selectedStudent: null,
    filters: { search: '', campus_id: '', status: '', sort: 'recent' },
    pagination: { page: 1, limit: 12, total: 0, total_pages: 1 },
    isLoading: false, isLoadingDetail: false, error: '', detailError: '',
  }),
  actions: {
    request(path, options = {}) {
      const auth = useAuthStore();
      return $fetch(path, { baseURL: useRuntimeConfig().public.apiBase,
        headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    async fetchSummary() { this.summary = (await this.request('/admin/student-progress/summary')).data; },
    async fetchStudents() {
      this.isLoading = true; this.error = '';
      try {
        const query = { ...Object.fromEntries(Object.entries(this.filters).filter(([, value]) => value !== '')), page: this.pagination.page, limit: this.pagination.limit };
        const response = await this.request('/admin/student-progress', { query });
        this.students = response.data || []; this.pagination = response.pagination || this.pagination;
      } catch (error) { this.students = []; this.error = error?.data?.message || 'Gagal memuat progress siswa.'; }
      finally { this.isLoading = false; }
    },
    async fetchDetail(id) {
      this.selectedStudent = null; this.detailError = ''; this.isLoadingDetail = true;
      try { this.selectedStudent = (await this.request(`/admin/student-progress/user/${id}`)).data; }
      catch (error) { this.detailError = error?.data?.message || 'Gagal memuat detail siswa.'; }
      finally { this.isLoadingDetail = false; }
    },
  },
});
