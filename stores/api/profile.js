import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useProfileStore = defineStore('profile', {
  state: () => ({ profileData: null, user: null, studentProfile: null, target: null, tutorProfile: null, summary: null, performance: null, recentContent: [], provinces: [], cities: [], campuses: [], programs: [], isLoading: false, isSaving: false, isUploadingPhoto: false, error: '' }),
  actions: {
    async request(path, options = {}) {
      const auth = useAuthStore();
      return $fetch(path, { baseURL: useRuntimeConfig().public.apiBase, headers: { Authorization: `Bearer ${auth.token}` }, ...options });
    },
    setProfile(data) {
      this.profileData = data; this.user = data?.user || null; this.studentProfile = data?.profile || null;
      this.target = data?.target || null; this.tutorProfile = data?.tutor_profile || null;
      this.summary = data?.summary || null; this.performance = data?.performance || null; this.recentContent = data?.recent_content || [];
      if (data?.user) {
        const auth = useAuthStore();
        auth.user = { ...(auth.user || {}), ...data.user, ...(data.role === 2 ? { profile: data.profile, target: data.target } : {}) };
        if (import.meta.client) localStorage.setItem('user', JSON.stringify(auth.user));
      }
    },
    async fetchProfile() {
      this.isLoading = true; this.error = '';
      try { const response = await this.request('/profile'); this.setProfile(response.data); return response.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal memuat profil.'; this.profileData = null; return null; }
      finally { this.isLoading = false; }
    },
    async save(path, payload) {
      this.isSaving = true; this.error = '';
      try { const response = await this.request(path, { method: 'PUT', body: payload }); this.setProfile(response.data); return response.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal menyimpan perubahan.'; throw error; }
      finally { this.isSaving = false; }
    },
    updateCommonProfile(payload) { return this.save('/profile', payload); },
    updateStudentProfile(payload) { return this.save('/profile/student', payload); },
    updateTarget(payload) { return this.save('/profile/target', payload); },
    updateTutorProfile(payload) { return this.save('/profile/tutor', payload); },
    async uploadPhoto(file) {
      this.isUploadingPhoto = true; this.error = '';
      try { const body = new FormData(); body.append('foto_profile', file); const response = await this.request('/profile/photo', { method: 'PUT', body }); this.setProfile(response.data); return response.data; }
      catch (error) { this.error = error?.data?.message || 'Gagal mengunggah foto.'; throw error; }
      finally { this.isUploadingPhoto = false; }
    },
    async changePassword(payload) {
      this.isSaving = true; this.error = '';
      try { await this.request('/auth/reset-password', { method: 'PUT', body: payload }); return true; }
      catch (error) { this.error = error?.data?.message || 'Gagal mengubah kata sandi.'; throw error; }
      finally { this.isSaving = false; }
    },
    async fetchProvinces() { const response = await this.request('/wilayah/provinsi'); this.provinces = response.data || []; return this.provinces; },
    async fetchCities(code) { if (!code) { this.cities = []; return []; } const response = await this.request('/wilayah/kota-kab', { query: { provinsi_kode: code } }); this.cities = response.data || []; return this.cities; },
    async fetchCampuses() { const response = await this.request('/kampus'); this.campuses = response.data || []; return this.campuses; },
    async fetchPrograms(campusId) { if (!campusId) { this.programs = []; return []; } const response = await this.request(`/kampus/${campusId}/prodi`); this.programs = response.data || []; return this.programs; },
  },
});
