import { defineStore } from 'pinia';

export const useSupportSettingsStore = defineStore('supportSettings', {
  state: () => ({ loaded: false, isLoading: false, whatsapp: '', instagram: '', appVersion: '' }),
  actions: {
    async fetchOnce() {
      if (this.loaded || this.isLoading) return;
      this.isLoading = true;
      try {
        const response = await $fetch('/settings/public', { baseURL: useRuntimeConfig().public.apiBase });
        const general = response.data?.general || {};
        this.whatsapp = general.support_whatsapp || '';
        this.instagram = general.support_instagram || '';
        this.appVersion = general.app_version || '';
        this.loaded = true;
      } catch { /* Runtime config remains available when public settings are offline. */ }
      finally { this.isLoading = false; }
    },
  },
});
