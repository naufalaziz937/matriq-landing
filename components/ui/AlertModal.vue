<template>
  <Teleport to="body">
    <Transition name="alert-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        @click.self="closeOnBackdrop && handleClose()"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="alert-modal-title"
          aria-describedby="alert-modal-message"
          class="relative w-full max-w-sm bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] border border-slate-100 overflow-hidden text-center"
        >
          <!-- Close / Dismiss Mini Action -->
          <button
            type="button"
            aria-label="Tutup"
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition z-10"
            @click="handleClose"
          >
            <svg
              class="w-4.5 h-4.5"
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

          <!-- Body -->
          <div class="pt-9 pb-6 px-6 sm:px-8 flex flex-col items-center">
            <!-- Mascot + Status Icon Badge -->
            <div class="relative mb-4">
              <div
                class="absolute inset-0 rounded-full blur-2xl opacity-40 scale-90"
                :class="isSuccess ? 'bg-emerald-300' : 'bg-rose-300'"
              ></div>
              <img
                :src="resolvedImage"
                :alt="resolvedTitle"
                class="relative w-28 h-28 object-contain drop-shadow-md"
              />
              <span
                class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white"
                :class="isSuccess ? 'bg-emerald-500' : 'bg-rose-500'"
              >
                <svg
                  v-if="isSuccess"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                  />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                  />
                </svg>
              </span>
            </div>

            <!-- Eyebrow Pill Badge -->
            <div
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-2.5 border"
              :class="
                isSuccess
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              "
            >
              <span>{{ resolvedEyebrow }}</span>
            </div>

            <!-- Title & Message -->
            <h2
              id="alert-modal-title"
              class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight"
            >
              {{ resolvedTitle }}
            </h2>
            <p
              id="alert-modal-message"
              class="text-sm text-slate-600 mt-1.5 leading-relaxed"
            >
              {{ message }}
            </p>
          </div>

          <!-- Footer / Actions -->
          <div class="px-6 sm:px-8 pb-6 flex flex-col gap-2">
            <button
              type="button"
              class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-[0_10px_25px_-5px_rgba(249,115,22,0.35)] hover:-translate-y-px active:translate-y-0 transition duration-200 cursor-pointer"
              :class="
                isSuccess
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-rose-600 hover:bg-rose-700'
              "
              @click="handleConfirm"
            >
              <span>{{ resolvedConfirmText }}</span>
              <span class="text-base">{{ isSuccess ? "🚀" : "🔁" }}</span>
            </button>

            <button
              v-if="showCancel"
              type="button"
              class="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 transition hover:underline"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import thumbsMascot from "/mascot/thumbs.svg";
import cryMascot from "/mascot/cry.svg";

const props = defineProps({
  // Kontrol tampil/sembunyi modal — pakai v-model
  modelValue: {
    type: Boolean,
    default: false,
  },
  // 'success' pakai maskot thumbs-up, 'error' pakai maskot menangis.
  // Bisa ditambah varian lain selama kamu sediakan prop `image` sendiri.
  type: {
    type: String,
    default: "success",
    validator: (v) => ["success", "error"].includes(v),
  },
  // Override teks kecil di atas judul (opsional)
  eyebrow: {
    type: String,
    default: "",
  },
  // Override judul (opsional, kalau kosong pakai default sesuai type)
  title: {
    type: String,
    default: "",
  },
  // Isi pesan alert — wajib diisi tiap dipakai
  message: {
    type: String,
    required: true,
  },
  // Override gambar maskot (opsional, kalau kosong pakai default sesuai type)
  image: {
    type: String,
    default: "",
  },
  // Override teks tombol utama (opsional)
  confirmText: {
    type: String,
    default: "",
  },
  // Tampilkan tombol sekunder ("Tutup" / batal)
  showCancel: {
    type: Boolean,
    default: false,
  },
  cancelText: {
    type: String,
    default: "Tutup",
  },
  // Klik area gelap di luar kartu ikut menutup modal
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "close", "confirm", "cancel"]);

const isSuccess = computed(() => props.type === "success");

const resolvedImage = computed(
  () => props.image || (isSuccess.value ? thumbsMascot : cryMascot),
);

const resolvedEyebrow = computed(
  () =>
    props.eyebrow ||
    (isSuccess.value ? "Yeay, Berhasil! 🎉" : "Ada yang Salah 😢"),
);

const resolvedTitle = computed(
  () => props.title || (isSuccess.value ? "Berhasil!" : "Gagal, Coba Lagi"),
);

const resolvedConfirmText = computed(
  () => props.confirmText || (isSuccess.value ? "Lanjutkan" : "Coba Lagi"),
);

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function handleClose() {
  close();
}

function handleCancel() {
  emit("cancel");
  close();
}

function handleConfirm() {
  emit("confirm");
  close();
}
</script>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.2s ease;
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
}
</style>
