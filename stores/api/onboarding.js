import { defineStore } from "pinia";

export const useOnboardingStore = defineStore("onboarding", {
  state: () => ({
    provinces: [],
    cities: [],
    kampus: [],
    prodi: [],

    isLoadingProvince: false,
    isLoadingCity: false,
    isLoadingKampus: false,
    isLoadingProdi: false,

    error: null,
  }),

  actions: {
    getApiBase() {
      const config = useRuntimeConfig();
      return config.public.apiBase || "http://localhost:4000/api";
    },

    async fetchProvinces() {
      const apiBase = this.getApiBase();

      this.isLoadingProvince = true;
      this.error = null;

      console.log("[STORE] fetchProvinces:", `${apiBase}/wilayah/provinsi`);

      try {
        const response = await $fetch(`${apiBase}/wilayah/provinsi`, {
          method: "GET",
        });

        console.log("[STORE] provinsi response:", response);

        this.provinces = response?.data || [];
        return this.provinces;
      } catch (error) {
        console.error("[STORE] GAGAL FETCH PROVINSI:", error);
        this.provinces = [];
        this.error =
          error?.data?.message ||
          error?.message ||
          "Gagal mengambil data provinsi";
        throw error;
      } finally {
        this.isLoadingProvince = false;
      }
    },

    async fetchCities(provinsiKode) {
      const apiBase = this.getApiBase();

      this.cities = [];

      if (!provinsiKode) return [];

      this.isLoadingCity = true;
      this.error = null;

      try {
        const response = await $fetch(`${apiBase}/wilayah/kota-kab`, {
          method: "GET",
          query: {
            provinsi_kode: provinsiKode,
          },
        });

        console.log("[STORE] kota/kab response:", response);

        this.cities = response?.data || [];
        return this.cities;
      } catch (error) {
        console.error("[STORE] GAGAL FETCH KOTA/KAB:", error);
        this.cities = [];
        this.error =
          error?.data?.message ||
          error?.message ||
          "Gagal mengambil kota/kabupaten";
        throw error;
      } finally {
        this.isLoadingCity = false;
      }
    },

    async fetchKampus() {
      const apiBase = this.getApiBase();

      this.isLoadingKampus = true;
      this.error = null;

      console.log("[STORE] fetchKampus:", `${apiBase}/kampus`);

      try {
        const response = await $fetch(`${apiBase}/kampus`, {
          method: "GET",
        });

        console.log("[STORE] kampus response:", response);

        this.kampus = response?.data || [];
        return this.kampus;
      } catch (error) {
        console.error("[STORE] GAGAL FETCH KAMPUS:", error);
        this.kampus = [];
        this.error =
          error?.data?.message ||
          error?.message ||
          "Gagal mengambil data kampus";
        throw error;
      } finally {
        this.isLoadingKampus = false;
      }
    },

    async fetchProdi(kampusId) {
      const apiBase = this.getApiBase();

      this.prodi = [];

      if (!kampusId) return [];

      this.isLoadingProdi = true;
      this.error = null;

      try {
        const response = await $fetch(
          `${apiBase}/kampus/${kampusId}/prodi`,
          {
            method: "GET",
          },
        );

        console.log("[STORE] prodi response:", response);

        this.prodi = response?.data || [];
        return this.prodi;
      } catch (error) {
        console.error("[STORE] GAGAL FETCH PRODI:", error);
        this.prodi = [];
        this.error =
          error?.data?.message ||
          error?.message ||
          "Gagal mengambil data prodi";
        throw error;
      } finally {
        this.isLoadingProdi = false;
      }
    },

    resetCities() {
      this.cities = [];
    },

    resetProdi() {
      this.prodi = [];
    },
  },
});
