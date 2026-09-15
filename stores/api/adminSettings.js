import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/api/auth';

export const useAdminSettingsStore=defineStore('adminSettings',{
  state:()=>({ settings:{}, original:{}, systemStatus:null, meta:{}, isLoading:false, isSaving:false, error:'', success:'' }),
  getters:{ hasChanges:state=>JSON.stringify(state.settings)!==JSON.stringify(state.original) },
  actions:{
    request(path,options={}) { const auth=useAuthStore(); return $fetch(path,{baseURL:useRuntimeConfig().public.apiBase,headers:{Authorization:`Bearer ${auth.token}`},...options}); },
    async fetchSettings() { this.isLoading=true; this.error=''; try { const result=await this.request('/admin/settings'); this.settings=structuredClone(result.data); this.original=structuredClone(result.data); this.meta=result.meta || {}; } catch(e) { this.error=e?.data?.message || 'Gagal memuat pengaturan.'; } finally { this.isLoading=false; } },
    async fetchSystemStatus() { try { this.systemStatus=(await this.request('/admin/settings/system-status')).data; } catch(e) { this.error=e?.data?.message || 'Gagal memuat status sistem.'; } },
    resetChanges() { this.settings=structuredClone(this.original); this.error=''; this.success=''; },
    async saveSettings() {
      if (!this.hasChanges || this.isSaving) return;
      this.isSaving=true; this.error=''; this.success='';
      try {
        const changes={};
        for(const [category,values] of Object.entries(this.settings)) for(const [key,value] of Object.entries(values)) {
          if(JSON.stringify(value)!==JSON.stringify(this.original?.[category]?.[key])) (changes[category] ||= {})[key]=value;
        }
        const result=await this.request('/admin/settings',{method:'PUT',body:changes});
        this.settings=structuredClone(result.data); this.original=structuredClone(result.data); this.success='Pengaturan berhasil disimpan.';
      } catch(e) { this.error=e?.data?.message || 'Gagal menyimpan pengaturan.'; }
      finally { this.isSaving=false; }
    },
  },
});
