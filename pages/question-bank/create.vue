<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import QuestionForm from '~/components/question-bank/QuestionForm.vue';
import { useAuthStore } from '~/stores/api/auth';
import { useQuestionBankStore } from '~/stores/api/questionBank';
import { useAdminSettingsStore } from '~/stores/api/adminSettings';
import { canAccessPage, ROLES } from '~/utils/roles';

definePageMeta({ layout: 'default' });
const authStore = useAuthStore();
const bank = useQuestionBankStore();
const settings=useAdminSettingsStore();
const ready = ref(false);
const error = ref('');

async function save(payload: Record<string, any>) {
  error.value = '';
  try {
    await bank.createQuestion(payload);
    await navigateTo('/question-bank');
  } catch {
    error.value = bank.error || 'Gagal membuat soal.';
  }
}

onMounted(async () => {
  authStore.initializeAuth();
  if (!authStore.token) return navigateTo('/login');
  const user = await authStore.fetchCurrentUser();
  if (Number(user?.role) !== ROLES.ADMIN || !canAccessPage(user?.role, 'question.create')) return navigateTo('/dashboard');
  ready.value = true;
  await settings.fetchSettings();
});
</script>

<template>
  <div v-if="ready" class="mx-auto w-full max-w-[1536px] px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10">
    <NuxtLink to="/question-bank" class="mb-5 inline-flex items-center gap-2 font-label-sm text-label-sm text-primary-container"><ArrowLeft class="h-4 w-4" />Kembali ke Bank Soal</NuxtLink>
    <h1 class="mb-1 font-headline-md text-headline-md text-on-surface">Tambah Soal</h1>
    <p class="mb-5 font-body-sm text-body-sm text-on-surface-variant">Buat soal pilihan ganda baru untuk latihan MatrIQ.</p>
    <p v-if="error" role="alert" class="mb-4 rounded-2xl bg-danger-soft px-4 py-3 font-body-sm text-body-sm text-danger-rose">{{ error }}</p>
    <QuestionForm :categories="bank.categories" :saving="bank.isSubmitting" :default-status="settings.settings?.content?.admin_question_default_status || 'active'" @submit="save" />
  </div>
</template>
