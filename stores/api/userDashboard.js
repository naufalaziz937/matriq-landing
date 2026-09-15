import {defineStore} from 'pinia';
import {useAuthStore} from '~/stores/api/auth';
export const useUserDashboardStore=defineStore('userDashboard',{
  state:()=>({dashboard:null,stats:null,target:null,progress:null,recentActivities:[],recommendations:[],tryoutTrend:[],subtestPerformance:[],isLoading:false,error:''}),
  actions:{
    async fetchUserDashboard(){
      this.isLoading=true;this.error='';
      try{
        const auth=useAuthStore();
        const response=await $fetch('/user/dashboard',{baseURL:useRuntimeConfig().public.apiBase,headers:{Authorization:`Bearer ${auth.token}`}});
        const data=response.data;
        this.dashboard=data;this.stats=data.stats;this.target=data.target;this.progress=data.daily_progress;
        this.recentActivities=data.recent_activities||[];this.recommendations=data.recommendations||[];this.tryoutTrend=data.tryout_trend||[];this.subtestPerformance=data.subtest_performance||[];
        return data;
      }catch(e){this.error=e?.data?.message||'Gagal memuat dashboard.';this.dashboard=null;return null;}
      finally{this.isLoading=false;}
    },
  },
});
