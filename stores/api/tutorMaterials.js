import {defineStore} from 'pinia';
import {useAuthStore} from '~/stores/api/auth';
export const useTutorMaterialsStore=defineStore('tutorMaterials',{
  state:()=>({items:[],pagination:{page:1,limit:10,total:0,total_pages:1},loading:false,saving:false,error:''}),
  actions:{
    request(path,options={}){const auth=useAuthStore();return $fetch(path,{baseURL:useRuntimeConfig().public.apiBase,headers:{Authorization:`Bearer ${auth.token}`},...options});},
    async fetchItems(){this.loading=true;this.error='';try{const result=await this.request('/tutor/materials',{query:{page:this.pagination.page,limit:this.pagination.limit}});this.items=result.data||[];this.pagination=result.pagination||this.pagination;}catch(e){this.items=[];this.error=e?.data?.message||'Gagal memuat materi.';}finally{this.loading=false;}},
    async save(id,form){this.saving=true;try{const body=new FormData();for(const [key,value] of Object.entries(form))if(value!=null&&value!=='')body.append(key,value);return await this.request(id?`/tutor/materials/${id}`:'/tutor/materials',{method:id?'PUT':'POST',body});}finally{this.saving=false;}},
    submit(id){return this.request(`/tutor/materials/${id}/submit`,{method:'PUT'});},
    remove(id){return this.request(`/tutor/materials/${id}`,{method:'DELETE'});},
    async download(item){const auth=useAuthStore();const response=await fetch(`${useRuntimeConfig().public.apiBase}/tutor/materials/${item.id}/file`,{headers:{Authorization:`Bearer ${auth.token}`}});if(!response.ok)throw new Error('Gagal mengunduh file.');const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');link.href=url;link.download=item.file_name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);},
  },
});
