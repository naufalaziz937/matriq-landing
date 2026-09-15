<script setup>
import {onMounted,ref} from 'vue';
import {ArrowLeft} from 'lucide-vue-next';
import MaterialForm from '~/components/tutor/MaterialForm.vue';
import {useAuthStore} from '~/stores/api/auth';
import {useTutorMaterialsStore} from '~/stores/api/tutorMaterials';
import {canAccessPage} from '~/utils/roles';
definePageMeta({layout:'default'});
const auth=useAuthStore(),store=useTutorMaterialsStore(),ready=ref(false),error=ref('');
async function save(form){error.value='';try{await store.save(null,form);await navigateTo('/my-materials');}catch(e){error.value=e?.data?.message||'Gagal membuat materi.';}}
onMounted(async()=>{auth.initializeAuth();if(!auth.token)return navigateTo('/login');const user=await auth.fetchCurrentUser();if(Number(user?.role)!==3||!canAccessPage(user?.role,'materials.create'))return navigateTo('/dashboard');ready.value=true;});
</script>
<template><div v-if="ready" class="mx-auto w-full max-w-[900px] px-4 py-5 sm:px-6"><NuxtLink to="/my-materials" class="mb-5 inline-flex items-center gap-2 text-sm text-primary-container"><ArrowLeft class="h-4 w-4"/>Kembali ke Materi Saya</NuxtLink><h1 class="mb-4 font-headline-md text-headline-md">Tambah Materi</h1><p v-if="error" role="alert" class="mb-4 rounded-2xl bg-danger-soft p-3 text-danger-rose">{{ error }}</p><MaterialForm :saving="store.saving" @submit="save"/></div></template>
