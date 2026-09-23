import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useMaterialsStore = defineStore('materials', {
  state: () => ({
    materials: [], selectedMaterial: null,
    summary: { total: null, active: null, draft: null },
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    filters: { search: '', subtest: '', status: '', category: '' },
    categories: [], categoryOptions: [], isLoading: false, isLoadingCategories: false, isSubmitting: false, error: '', categoryError: '', requestId: 0, categoryRequestId: 0,
  }),
  actions: {
    base() { return useRuntimeConfig().public.apiBase || 'http://localhost:4000/api'; },
    token() { return useAuthStore().token; },
    request(path, options = {}) {
      return $fetch(path, { baseURL: this.base(), headers: { Authorization: `Bearer ${this.token()}` }, ...options });
    },
    async fetchMaterials() {
      const current = ++this.requestId;
      this.isLoading = true;
      this.error = '';
      try {
        const response = await this.request('/admin/materials', {
          query: { page: this.pagination.page, limit: this.pagination.limit, ...Object.fromEntries(Object.entries(this.filters).filter(([, value]) => String(value).trim())) },
        });
        if (current !== this.requestId) return;
        this.materials = Array.isArray(response?.data) ? response.data : [];
        this.categories = Array.isArray(response?.categories) ? response.categories : [];
        this.pagination.total = Number(response?.pagination?.total ?? this.materials.length);
        this.pagination.totalPages = Math.max(1, Number(response?.pagination?.total_pages ?? 1));
      } catch (error) {
        if (current !== this.requestId) return;
        this.materials = [];
        this.pagination.total = 0;
        this.pagination.totalPages = 1;
        this.error = error?.data?.message || 'Gagal memuat materi';
      } finally {
        if (current === this.requestId) this.isLoading = false;
      }
    },
    async fetchSummary() {
      try {
        const response = await this.request('/admin/materials/summary');
        this.summary = response?.data ?? { total: null, active: null, draft: null };
      } catch { this.summary = { total: null, active: null, draft: null }; }
    },
    async fetchCategoryOptions(subtests) {
      const current = ++this.categoryRequestId;
      this.categoryOptions = [];
      this.categoryError = '';
      const selected = Array.isArray(subtests) ? subtests : [subtests].filter(Boolean);
      if (!selected.length) return;
      this.isLoadingCategories = true;
      try {
        const response = await this.request('/question-materials/categories', { query: { subtests: selected.join(',') } });
        if (current === this.categoryRequestId) this.categoryOptions = Array.isArray(response?.data) ? response.data : [];
      } catch (error) { if (current === this.categoryRequestId) this.categoryError = error?.data?.message || 'Gagal memuat kategori'; }
      finally { if (current === this.categoryRequestId) this.isLoadingCategories = false; }
    },
    async fetchMaterialById(id) {
      this.selectedMaterial = null;
      const response = await this.request(`/admin/materials/${encodeURIComponent(id)}`);
      this.selectedMaterial = response?.data ?? null;
      return this.selectedMaterial;
    },
    async submit(path, method, body) {
      this.isSubmitting = true;
      this.error = '';
      try { return await this.request(path, { method, body }); }
      catch (error) { this.error = error?.data?.message || error?.message || 'Gagal menyimpan materi'; throw error; }
      finally { this.isSubmitting = false; }
    },
    createMaterial(body) { return this.submit('/admin/materials', 'POST', body); },
    updateMaterial(id, body) { return this.submit(`/admin/materials/${encodeURIComponent(id)}`, 'PUT', body); },
    deleteMaterial(id) { return this.submit(`/admin/materials/${encodeURIComponent(id)}`, 'DELETE'); },
    async fetchFile(id) {
      const response = await fetch(`${this.base()}/admin/materials/${encodeURIComponent(id)}/file`, {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (!response.ok) throw new Error('Gagal membuka file materi');
      return response.blob();
    },
  },
});
