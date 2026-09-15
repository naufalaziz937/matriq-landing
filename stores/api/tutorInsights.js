import {defineStore} from 'pinia';
import {useAuthStore} from '~/stores/api/auth';
export const useTutorInsightsStore=defineStore('tutorInsights',{
  state:()=>({moderation:[],analytics:null,studentInsights:null,loading:false,error:''}),
  actions:{
    request(path){const auth=useAuthStore();return $fetch(`/tutor/${path}`,{baseURL:useRuntimeConfig().public.apiBase,headers:{Authorization:`Bearer ${auth.token}`}});},
    async fetchSection(name){this.loading=true;this.error='';try{const result=await this.request(name);if(name==='moderation')this.moderation=result.data||[];if(name==='analytics')this.analytics=result.data;if(name==='student-insights')this.studentInsights=result.data;}catch(e){this.error=e?.data?.message||'Gagal memuat data Tutor.';}finally{this.loading=false;}},
  },
});
