import {defineStore} from 'pinia';
import {useAuthStore} from '~/stores/api/auth';
export const useTutorDashboardStore=defineStore('tutorDashboard',{
  state:()=>({summary:null,recentContent:[],recentModeration:[],contributionTrend:[],isLoading:false,error:''}),
  actions:{async fetchTutorDashboard(){this.isLoading=true;this.error='';try{const auth=useAuthStore();const response=await $fetch('/tutor/dashboard',{baseURL:useRuntimeConfig().public.apiBase,headers:{Authorization:`Bearer ${auth.token}`}});const data=response.data||{};this.summary=data.summary||null;this.recentContent=data.recent_content||[];this.recentModeration=data.recent_moderation||[];this.contributionTrend=data.contribution_trend||[];}catch(e){this.error=e?.data?.message||'Gagal memuat dashboard Tutor.';}finally{this.isLoading=false;}}},
});
