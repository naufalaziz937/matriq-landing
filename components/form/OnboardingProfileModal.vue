<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-hidden overscroll-contain"
      @click.self="handleSkip"
      @wheel.stop
      @touchmove.stop
    >
      <!-- Modal Card -->
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        class="relative w-full max-w-[760px] bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        <!-- ================================================= -->
        <!-- HEADER -->
        <!-- ================================================= -->

        <div
          class="relative bg-gradient-to-b from-blue-50/90 via-blue-50/40 to-white pt-6 pb-4 px-6 sm:px-8 border-b border-slate-100 text-center flex-shrink-0"
        >
          <!-- CLOSE -->
          <button
            type="button"
            aria-label="Tutup formulir"
            class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition"
            @click="handleSkip"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </button>

          <div class="flex flex-col items-center">
            <!-- MASCOT -->
            <div class="relative -mt-2 mb-2">
              <img
                alt="Mascot MatrIQ UTBK"
                class="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-md"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-cPI1cwNsFHnqh9cOPEySYqM6AKgLfp3wE8cunQp7cbQn0gPwV30OkDWKX-XazUvFQQ-LK7A5v746IdbMriQTfVWJ0rbvwquUH40cRrennd4x4oBsvRE1fxiT0SwPo_0SLWTuUY9zsjx3w4VK2OBFrQIzTbvEAp4gmH68xijsnJPGV0IMunA7O9z3eYMmTvBOL82fBu6ipKhwGz16jsfiioI3xXcDY4UDG0R0-z4qbSqBYHiSAi3HP-WqBiL-HUiVVg"
              />
            </div>

            <div
              class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-semibold mb-2 shadow-sm"
            >
              <span> Langkah Pertama Menuju Kampus Impian! 🎓✨ </span>
            </div>

            <h1
              id="modal-title"
              class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
            >
              Lengkapi Profil Belajarmu
            </h1>

            <p
              class="text-xs sm:text-sm text-slate-600 max-w-lg mt-1 leading-relaxed"
            >
              Isi beberapa informasi agar pengalaman belajar di MatrIQ bisa
              disesuaikan dengan kebutuhan dan target UTBK kamu.
            </p>
          </div>
        </div>

        <!-- ================================================= -->
        <!-- BODY -->
        <!-- ================================================= -->

        <div
          class="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-6 sm:px-8 py-6"
          @wheel.stop
          @touchmove.stop
        >
          <form
            id="onboardingForm"
            class="space-y-7"
            @submit.prevent="handleSubmit"
          >
            <p v-if="errorMessage" role="alert" class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}</p>
            <!-- ================================================= -->
            <!-- 01. INFORMASI PRIBADI -->
            <!-- ================================================= -->

            <section class="space-y-4">
              <div
                class="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase"
              >
                <span>01. Informasi Pribadi</span>

                <div class="flex-1 h-px bg-slate-100"></div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- NO HP -->

                <div class="space-y-1.5">
                  <label
                    for="no_hp"
                    class="block text-xs font-semibold text-slate-700"
                  >
                    No. WhatsApp / HP
                    <span class="text-rose-500">*</span>
                  </label>

                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <span
                        class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                      >
                        +62
                      </span>
                    </div>

                    <input
                      id="no_hp"
                      v-model="form.no_hp"
                      type="tel"
                      required
                      placeholder="81234567890"
                      class="block w-full pl-16 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <!-- GENDER -->

                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-slate-700">
                    Jenis Kelamin
                    <span class="text-rose-500">*</span>
                  </label>

                  <div class="grid grid-cols-2 gap-2">
                    <label
                      class="relative flex items-center justify-center p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700"
                    >
                      <input
                        v-model="form.gender"
                        type="radio"
                        name="gender"
                        value="L"
                        class="sr-only"
                      />

                      <span class="text-xs font-medium"> 👦 Laki-laki </span>
                    </label>

                    <label
                      class="relative flex items-center justify-center p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700"
                    >
                      <input
                        v-model="form.gender"
                        type="radio"
                        name="gender"
                        value="P"
                        class="sr-only"
                      />

                      <span class="text-xs font-medium"> 👧 Perempuan </span>
                    </label>
                  </div>
                </div>

                <!-- FOTO PROFILE -->

                <div class="sm:col-span-2 space-y-1.5">
                  <label class="block text-xs font-semibold text-slate-700">
                    Foto Profil

                    <span class="text-slate-400 font-normal"> (Opsional) </span>
                  </label>

                  <div
                    class="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50"
                  >
                    <!-- PREVIEW -->

                    <div
                      class="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0"
                    >
                      <img
                        v-if="photoPreview"
                        :src="photoPreview"
                        alt="Preview foto profil"
                        class="w-full h-full object-cover"
                      />

                      <svg
                        v-else
                        class="w-7 h-7 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.8"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 19h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    <div class="flex-1">
                      <input
                        ref="photoInput"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        class="hidden"
                        @change="handlePhotoChange"
                      />

                      <button
                        type="button"
                        class="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
                        @click="photoInput?.click()"
                      >
                        Pilih Foto
                      </button>

                      <button
                        v-if="photoPreview"
                        type="button"
                        class="ml-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        @click="removePhoto"
                      >
                        Hapus
                      </button>

                      <p class="text-[11px] text-slate-400 mt-2">
                        JPG, PNG, atau WEBP. Maksimal 5MB. Foto akan disimpan
                        melalui Cloudinary.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- ================================================= -->
            <!-- 02. DATA PENDIDIKAN -->
            <!-- ================================================= -->

            <section class="space-y-4">
              <div
                class="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase"
              >
                <span>02. Data Pendidikan</span>

                <div class="flex-1 h-px bg-slate-100"></div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- SEKOLAH -->

                <div class="sm:col-span-2 space-y-1.5">
                  <label
                    for="sekolah"
                    class="block text-xs font-semibold text-slate-700"
                  >
                    Asal Sekolah
                    <span class="text-rose-500">*</span>
                  </label>

                  <input
                    id="sekolah"
                    v-model="form.sekolah"
                    type="text"
                    required
                    placeholder="Contoh: SMAN 1 Bandung"
                    class="block w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400 text-slate-800"
                  />
                </div>

                <!-- KELAS -->

                <div class="space-y-1.5">
                  <label
                    for="kelas"
                    class="block text-xs font-semibold text-slate-700"
                  >
                    Kelas / Status
                    <span class="text-rose-500">*</span>
                  </label>

                  <select
                    id="kelas"
                    v-model="form.kelas"
                    required
                    class="block w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 bg-white"
                  >
                    <option disabled value="">Pilih kelas</option>

                    <option value="Kelas 10">Kelas 10</option>

                    <option value="Kelas 11">Kelas 11</option>

                    <option value="Kelas 12">Kelas 12</option>

                    <option value="Gap Year / Alumni">Gap Year / Alumni</option>
                  </select>
                </div>

                <!-- TAHUN LULUS -->

                <div class="space-y-1.5">
                  <label
                    for="tahun_lulus"
                    class="block text-xs font-semibold text-slate-700"
                  >
                    Tahun Lulus
                    <span class="text-rose-500">*</span>
                  </label>

                  <input
                    id="tahun_lulus"
                    v-model.number="form.tahun_lulus"
                    type="number"
                    min="2020"
                    max="2035"
                    required
                    placeholder="2026"
                    class="block w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400 text-slate-800"
                  />
                </div>

                <!-- PROVINSI -->

                <div class="space-y-1.5">
                  <label
                    for="provinsi"
                    class="block text-xs font-semibold text-slate-700"
                  >
                    Provinsi
                    <span class="text-rose-500">*</span>
                  </label>

                  <select
                    id="provinsi"
                    v-model="form.provinsi"
                    required
                    :disabled="isLoadingProvince"
                    class="block w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option disabled value="">
                      {{
                        isLoadingProvince
                          ? "Memuat provinsi..."
                          : "Pilih provinsi"
                      }}
                    </option>

                    <option
                      v-for="province in provinces"
                      :key="province.kode"
                      :value="province.kode"
                    >
                      {{ province.nama }}
                    </option>
                  </select>
                </div>

                <!-- KOTA / KAB -->

                <div class="space-y-1.5">
                  <label
                    for="kota_kab"
                    class="block text-xs font-semibold text-slate-700"
                  >
                    Kota / Kabupaten
                    <span class="text-rose-500">*</span>
                  </label>

                  <select
                    id="kota_kab"
                    v-model="form.kota_kab"
                    required
                    :disabled="!form.provinsi || isLoadingCity"
                    class="block w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option disabled value="">
                      {{
                        isLoadingCity
                          ? "Memuat kota / kabupaten..."
                          : !form.provinsi
                            ? "Pilih provinsi terlebih dahulu"
                            : "Pilih kota / kabupaten"
                      }}
                    </option>

                    <option
                      v-for="city in cities"
                      :key="city.kode"
                      :value="city.kode"
                    >
                      {{ city.label || `${city.jenis} ${city.nama}` }}
                    </option>
                  </select>
                </div>
              </div>
            </section>

            <!-- ================================================= -->
            <!-- 03. TARGET UTBK -->
            <!-- ================================================= -->

            <section
              class="space-y-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4 sm:p-5 rounded-2xl border border-blue-200"
            >
              <div class="flex items-center gap-2">
                <span class="text-base"> 🎯 </span>

                <div>
                  <h3 class="text-sm font-bold text-slate-900">Target UTBK</h3>

                  <p class="text-[11px] text-slate-500">
                    Tentukan kampus, program studi, dan target skor UTBK kamu.
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- KAMPUS -->

                <div class="space-y-1.5">
                  <label
                    for="kampus"
                    class="block text-xs font-semibold text-slate-700"
                  >
                    Kampus Tujuan
                    <span class="text-rose-500">*</span>
                  </label>

                  <select
                    id="kampus"
                    v-model="form.kampus_id"
                    required
                    :disabled="isLoadingKampus"
                    class="block w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option disabled value="">
                      {{
                        isLoadingKampus ? "Memuat kampus..." : "Pilih kampus"
                      }}
                    </option>

                    <option
                      v-for="item in kampus"
                      :key="item.id"
                      :value="item.id"
                    >
                      {{
                        item.singkatan
                          ? `${item.singkatan} - ${item.nama}`
                          : item.nama
                      }}
                    </option>
                  </select>
                </div>

                <!-- PRODI -->

                <div class="space-y-1.5">
                  <label
                    for="prodi"
                    class="block text-xs font-semibold text-slate-700"
                  >
                    Program Studi
                    <span class="text-rose-500">*</span>
                  </label>

                  <select
                    id="prodi"
                    v-model="form.pilihan"
                    required
                    :disabled="!form.kampus_id || isLoadingProdi"
                    class="block w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option disabled value="">
                      {{
                        isLoadingProdi
                          ? "Memuat program studi..."
                          : !form.kampus_id
                            ? "Pilih kampus terlebih dahulu"
                            : "Pilih program studi"
                      }}
                    </option>

                    <option
                      v-for="item in prodi"
                      :key="item.kode_snbt"
                      :value="item.kode_snbt"
                    >
                      {{ item.nama }}
                    </option>
                  </select>
                </div>

                <!-- TARGET SCORE -->

                <div class="sm:col-span-2 space-y-1.5">
                  <label
                    for="target_score"
                    class="block text-xs font-semibold text-slate-700"
                  >
                    Target Skor UTBK
                    <span class="text-rose-500">*</span>
                  </label>

                  <input
                    id="target_score"
                    v-model.number="form.target_score"
                    type="number"
                    min="0"
                    max="1000"
                    required
                    placeholder="Contoh: 700"
                    class="block w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400 text-slate-800 bg-white"
                  />
                </div>
              </div>
            </section>

            <!-- STORE ERROR -->

            <div
              v-if="storeError"
              class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600"
            >
              {{ storeError }}
            </div>
          </form>
        </div>

        <!-- ================================================= -->
        <!-- FOOTER -->
        <!-- ================================================= -->

        <div
          class="bg-slate-50 border-t border-slate-200 px-6 sm:px-8 py-4 flex-shrink-0"
        >
          <div
            class="flex flex-col-reverse sm:flex-row items-center justify-between gap-3"
          >
            <button
              type="button"
              class="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 transition hover:underline"
              @click="handleSkip"
            >
              Lewati untuk sekarang
            </button>

            <button
              type="submit"
              form="onboardingForm"
              :disabled="loading"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition"
            >
              <template v-if="!loading">
                <span> Simpan Profil & Mulai Belajar </span>

                <span> 🚀 </span>
              </template>

              <template v-else>
                <svg
                  class="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />

                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>

                <span> Menyimpan... </span>
              </template>
            </button>
          </div>

          <p class="text-center text-[11px] text-slate-400 mt-3">
            🔒 Datamu hanya digunakan untuk personalisasi pengalaman belajar di
            MatrIQ.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch, onMounted, onBeforeUnmount } from "vue";

import { storeToRefs } from "pinia";

import { useOnboardingStore } from "~/stores/api/onboarding";

// ======================================================
// PROPS
// ======================================================

const props = defineProps({
  errorMessage: { type: String, default: '' },
  loading: {
    type: Boolean,
    default: false,
  },
});

// ======================================================
// EMITS
// ======================================================

const emit = defineEmits(["close", "skip", "submit"]);

// ======================================================
// STORE
// ======================================================

const onboardingStore = useOnboardingStore();

const {
  provinces,
  cities,
  kampus,
  prodi,

  isLoadingProvince,
  isLoadingCity,
  isLoadingKampus,
  isLoadingProdi,

  error: storeError,
} = storeToRefs(onboardingStore);

// ======================================================
// FORM
// ======================================================

const form = reactive({
  no_hp: "",

  gender: "L",

  foto_profile: null,

  sekolah: "",

  kelas: "",

  tahun_lulus: 2026,

  provinsi: "",

  kota_kab: "",

  kampus_id: "",

  // kode_snbt prodi
  pilihan: "",

  target_score: null,
});

// ======================================================
// FOTO PROFILE
// ======================================================

const photoInput = ref(null);

const photoPreview = ref("");

function handlePhotoChange(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    alert("Format foto harus JPG, JPEG, PNG, atau WEBP");

    event.target.value = "";

    return;
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    alert("Ukuran foto maksimal 5MB");

    event.target.value = "";

    return;
  }

  form.foto_profile = file;

  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value);
  }

  photoPreview.value = URL.createObjectURL(file);
}

function removePhoto() {
  form.foto_profile = null;

  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value);
  }

  photoPreview.value = "";

  if (photoInput.value) {
    photoInput.value.value = "";
  }
}

// ======================================================
// PROVINSI CHANGE
// ======================================================

watch(
  () => form.provinsi,

  async (provinsiKode) => {
    form.kota_kab = "";

    onboardingStore.resetCities();

    if (!provinsiKode) {
      return;
    }

    try {
      await onboardingStore.fetchCities(provinsiKode);
    } catch (error) {
      console.error("Gagal memuat kota/kab:", error);
    }
  },
);

// ======================================================
// KAMPUS CHANGE
// ======================================================

watch(
  () => form.kampus_id,

  async (kampusId) => {
    form.pilihan = "";

    onboardingStore.resetProdi();

    if (!kampusId) {
      return;
    }

    try {
      await onboardingStore.fetchProdi(kampusId);
    } catch (error) {
      console.error("Gagal memuat prodi:", error);
    }
  },
);

// ======================================================
 // MASTER DATA
 // ======================================================
 // Provinsi dan kampus di-fetch oleh dashboard saat mount.
 // Modal hanya memakai state store yang sama dan fetch city/prodi saat pilihan berubah.

 // ======================================================
 // SCROLL LOCK
// ======================================================

let originalBodyOverflow = "";

let originalBodyPaddingRight = "";

onMounted(() => {
  if (!import.meta.client) {
    return;
  }

  originalBodyOverflow = document.body.style.overflow;

  originalBodyPaddingRight = document.body.style.paddingRight;

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  document.body.style.overflow = "hidden";

});

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return;
  }

  document.body.style.overflow = originalBodyOverflow;

  document.body.style.paddingRight = originalBodyPaddingRight;

  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value);
  }

  onboardingStore.resetCities();

  onboardingStore.resetProdi();
});

// ======================================================
// SKIP
// ======================================================

function handleSkip() {
  emit("skip");

  emit("close");
}

// ======================================================
// SUBMIT
// ======================================================

function handleSubmit() {
  emit("submit", {
    no_hp: form.no_hp,

    gender: form.gender,

    foto_profile: form.foto_profile,

    sekolah: form.sekolah,

    kelas: form.kelas,

    tahun_lulus: form.tahun_lulus,

    // yang disimpan sekarang kode wilayah
    provinsi: form.provinsi,

    kota_kab: form.kota_kab,

    // kode_snbt prodi
    pilihan: form.pilihan,

    target_score: form.target_score,
  });
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

* {
  font-family: "Plus Jakarta Sans", sans-serif;
}

/* ============================= */
/* MODAL SCROLLBAR */
/* ============================= */

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
