import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useQuestionDependenciesStore = defineStore('questionDependencies', {
  state: () => ({
    categories: [], materials: [], isLoadingCategories: false, isLoadingMaterials: false,
    categoryError: '', materialError: '', categoryRequestId: 0, materialRequestId: 0,
  }),
  actions: {
    request(path, query) {
      const auth = useAuthStore();
      return $fetch(path, { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` }, query });
    },
    async fetchCategories(subtest) {
      const current = ++this.categoryRequestId;
      this.categories = []; this.materials = []; this.categoryError = '';
      if (!subtest) return;
      this.isLoadingCategories = true;
      try {
        const response = await this.request('/question-materials/categories', { subtests: Array.isArray(subtest) ? subtest.join(',') : subtest });
        if (current === this.categoryRequestId) this.categories = Array.isArray(response?.data) ? response.data : [];
      } catch (error) {
        if (current === this.categoryRequestId) this.categoryError = error?.data?.message || 'Gagal memuat kategori.';
      } finally { if (current === this.categoryRequestId) this.isLoadingCategories = false; }
    },
    async fetchMaterials(subtest, categoryId) {
      const current = ++this.materialRequestId;
      this.materials = []; this.materialError = '';
      if (!subtest || !categoryId) return;
      this.isLoadingMaterials = true;
      try {
        const response = await this.request('/question-materials', { subtest, category_id: categoryId });
        if (current === this.materialRequestId) this.materials = Array.isArray(response?.data) ? response.data : [];
      } catch (error) {
        if (current === this.materialRequestId) this.materialError = error?.data?.message || 'Gagal memuat materi aktif.';
      } finally { if (current === this.materialRequestId) this.isLoadingMaterials = false; }
    },
  },
});
