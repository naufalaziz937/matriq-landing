import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useUserMaterialsStore = defineStore('userMaterials', {
  state: () => ({ summary: null, subtests: [], materials: [], selectedMaterial: null, continueLearning: null, recommended: [], completedMaterials: [], snbtYear: null, filters: { subtest_id: '', status: 'all', search: '' }, pagination: { page: 1, total: 0, total_pages: 1 }, isLoading: false, isLoadingDetail: false, isUpdatingProgress: false, error: '' }),
  actions: {
    request(path = '', options = {}) { const auth = useAuthStore(); return $fetch(`/user/materials${path}`, { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` }, ...options }); },
    async fetchMaterials(page = 1) {
      this.isLoading = true; this.error = '';
      try { const { data } = await this.request('', { query: { ...this.filters, page, limit: 12 } }); this.summary = data.summary; this.subtests = data.subtests || []; this.materials = data.materials || []; this.continueLearning = data.continue_learning; this.recommended = data.recommended || []; this.completedMaterials = data.completed_materials || []; this.pagination = data.pagination; this.snbtYear = data.snbt_year; return data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat materi.'; return null; }
      finally { this.isLoading = false; }
    },
    async fetchMaterialDetail(id) {
      this.isLoadingDetail = true; this.error = ''; this.selectedMaterial = null;
      try { const { data } = await this.request(`/${encodeURIComponent(id)}`); this.selectedMaterial = data; return data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat detail materi.'; return null; }
      finally { this.isLoadingDetail = false; }
    },
    async mutate(id, path, method, body) {
      this.isUpdatingProgress = true; this.error = '';
      try { const { data } = await this.request(`/${encodeURIComponent(id)}${path}`, { method, ...(body ? { body } : {}) }); this.selectedMaterial = data; return data; }
      catch (error) { this.error = error?.data?.message || 'Gagal menyimpan progres materi.'; return null; }
      finally { this.isUpdatingProgress = false; }
    },
    startMaterial(id) { return this.mutate(id, '/start', 'POST'); },
    updateProgress(id, progress) { return this.mutate(id, '/progress', 'PUT', { progress_percentage: progress }); },
    completeMaterial(id) { return this.mutate(id, '/complete', 'PUT'); },
    completeTopic(id) { return this.completeMaterial(id); },
    async fetchFile(id) {
      try { return await this.request(`/${encodeURIComponent(id)}/file`, { responseType: 'blob' }); }
      catch (error) { this.error = error?.data?.message || 'Gagal membuka file materi.'; return null; }
    },
    setSubtest(value) { this.filters.subtest_id = value; return this.fetchMaterials(); },
    setStatus(value) { this.filters.status = value; return this.fetchMaterials(); },
    setSearch(value) { this.filters.search = value; return this.fetchMaterials(); },
  },
});
