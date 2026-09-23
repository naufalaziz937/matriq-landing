<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  AlertCircle, Check, ChevronLeft, ChevronRight, LoaderCircle, Pencil,
  Plus, RefreshCw, Search, ShieldCheck, Trash2, UserRound, Users, X,
} from 'lucide-vue-next';
import { useAuthStore } from '~/stores/api/auth';
import { getRoleLabel, ROLES } from '~/utils/roles';
import { useBodyScrollLock } from '~/composables/useBodyScrollLock';

definePageMeta({ layout: 'default' });

type UserRow = {
  user_id: number;
  nama: string;
  email: string;
  no_hp: string | null;
  gender: 'L' | 'P' | null;
  role: number;
  is_activate: boolean;
  created_at?: string;
};

const authStore = useAuthStore();
const apiBase = useRuntimeConfig().public.apiBase || 'http://localhost:4000/api';
const users = ref<UserRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const error = ref('');
const notice = ref('');
const search = ref('');
const roleFilter = ref('');
const page = ref(1);
const total = ref(0);
const totalPages = ref(1);
const ready = ref(false);
const showForm = ref(false);
useBodyScrollLock(showForm);
const editingId = ref<number | null>(null);
const deleteTarget = ref<UserRow | null>(null);
let requestId = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const form = reactive({
  nama: '', email: '', no_hp: '', gender: '', password: '', role: 2, is_activate: false,
});
const isEditing = computed(() => editingId.value !== null);
const firstRow = computed(() => total.value ? (page.value - 1) * 10 + 1 : 0);
const lastRow = computed(() => Math.min(page.value * 10, total.value));

function messageFromError(err: any, fallback: string) {
  return err?.data?.message || err?.message || fallback;
}

async function loadUsers() {
  if (!ready.value) return;
  const currentRequest = ++requestId;
  loading.value = true;
  error.value = '';
  try {
    const response = await $fetch<any>('/admin/users', {
      baseURL: apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
      query: { page: page.value, limit: 10, ...(search.value.trim() ? { search: search.value.trim() } : {}), ...(roleFilter.value ? { role: roleFilter.value } : {}) },
    });
    if (currentRequest !== requestId) return;
    users.value = Array.isArray(response?.data) ? response.data : [];
    total.value = Number(response?.pagination?.total ?? users.value.length);
    totalPages.value = Math.max(1, Number(response?.pagination?.total_pages ?? 1));
  } catch (err) {
    if (currentRequest === requestId) {
      users.value = [];
      total.value = 0;
      totalPages.value = 1;
      error.value = messageFromError(err, 'Gagal memuat daftar user.');
    }
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
}

function resetForm() {
  Object.assign(form, { nama: '', email: '', no_hp: '', gender: '', password: '', role: 2, is_activate: false });
  editingId.value = null;
  error.value = '';
}

function openCreate() {
  resetForm();
  showForm.value = true;
}

function openEdit(user: UserRow) {
  resetForm();
  editingId.value = user.user_id;
  Object.assign(form, {
    nama: user.nama, email: user.email, no_hp: user.no_hp || '',
    gender: user.gender || '', password: '', role: Number(user.role),
    is_activate: user.is_activate === true,
  });
  showForm.value = true;
}

async function saveUser() {
  if (saving.value) return;
  error.value = '';
  if (!form.nama.trim() || !form.email.trim()) {
    error.value = 'Nama dan email wajib diisi.';
    return;
  }
  if (!isEditing.value && form.password.length < 8) {
    error.value = 'Password minimal 8 karakter.';
    return;
  }
  if (isEditing.value && form.password && form.password.length < 8) {
    error.value = 'Password baru minimal 8 karakter.';
    return;
  }
  saving.value = true;
  try {
    await $fetch(`/admin/users${isEditing.value ? `/${editingId.value}` : ''}`, {
      baseURL: apiBase,
      method: isEditing.value ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        nama: form.nama.trim(), email: form.email.trim(), no_hp: form.no_hp.trim() || null,
        gender: form.gender || null, role: Number(form.role), is_activate: form.is_activate,
        ...(!isEditing.value || form.password ? { password: form.password } : {}),
      },
    });
    notice.value = isEditing.value ? 'User berhasil diperbarui.' : 'User berhasil dibuat.';
    showForm.value = false;
    if (!isEditing.value) page.value = 1;
    resetForm();
    await loadUsers();
  } catch (err) {
    error.value = messageFromError(err, 'Gagal menyimpan user.');
  } finally {
    saving.value = false;
  }
}

async function deleteUser() {
  if (!deleteTarget.value || deleting.value) return;
  deleting.value = true;
  error.value = '';
  try {
    await $fetch(`/admin/users/${deleteTarget.value.user_id}`, {
      baseURL: apiBase,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    deleteTarget.value = null;
    notice.value = 'User berhasil dihapus.';
    if (users.value.length === 1 && page.value > 1) page.value -= 1;
    await loadUsers();
  } catch (err) {
    error.value = messageFromError(err, 'Gagal menghapus user.');
  } finally {
    deleting.value = false;
  }
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    loadUsers();
  }, 350);
});
watch(roleFilter, () => { page.value = 1; loadUsers(); });
watch(page, loadUsers);

onMounted(async () => {
  authStore.initializeAuth();
  if (!authStore.token) return navigateTo('/login');
  const currentUser = await authStore.fetchCurrentUser();
  if (Number(currentUser?.role) !== ROLES.ADMIN) return navigateTo('/dashboard');
  ready.value = true;
  await loadUsers();
});
</script>

<template>
  <div v-if="ready" class="mx-auto w-full max-w-[1536px] min-w-0 px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div class="min-w-0">
        <p class="text-xs font-semibold text-blue-600">Admin · User Management</p>
        <h1 class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Kelola Pengguna</h1>
        <p class="mt-1 text-sm font-medium text-slate-500">Lihat, tambah, dan perbarui akun MatrIQ.</p>
      </div>
      <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700" @click="openCreate">
        <Plus class="h-4 w-4" /> Tambah User
      </button>
    </div>

    <div class="mb-5 flex min-w-0 items-center justify-between gap-4 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
      <div class="min-w-0">
        <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600"><Users class="h-5 w-5" /></div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pengguna</p>
        <p class="mt-1 text-3xl font-extrabold text-slate-900">{{ total }}</p>
        <p class="mt-1 text-xs font-medium text-slate-500">Sesuai pencarian dan filter saat ini</p>
      </div>
      <img src="/mascot/duduk-nobg.svg" alt="Maskot MatrIQ" class="h-28 w-28 shrink-0 object-contain sm:h-36 sm:w-36" draggable="false">
    </div>

    <div class="rounded-3xl border border-slate-100 bg-white p-4 shadow-card sm:p-6">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label class="relative min-w-0 flex-1">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input v-model="search" type="search" placeholder="Cari nama, email, atau nomor HP..." class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
        </label>
        <select v-model="roleFilter" aria-label="Filter role" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500">
          <option value="">Semua Role</option><option value="1">Admin</option><option value="2">Siswa</option><option value="3">Tutor</option>
        </select>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" :disabled="loading" @click="loadUsers">
          <RefreshCw class="h-4 w-4" :class="loading ? 'animate-spin' : ''" /> Muat Ulang
        </button>
      </div>

      <p v-if="notice" role="status" class="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><Check class="h-4 w-4" />{{ notice }}</p>
      <p v-if="error && !showForm && !deleteTarget" role="alert" class="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><AlertCircle class="h-4 w-4" />{{ error }}</p>

      <div v-if="loading" class="flex items-center justify-center gap-2 py-16 text-sm font-semibold text-slate-500"><LoaderCircle class="h-5 w-5 animate-spin" /> Memuat pengguna...</div>
      <div v-else-if="!users.length" class="flex flex-col items-center py-12 text-center">
        <img src="/mascot/memandang.svg" alt="Maskot MatrIQ mencari pengguna" class="mb-3 h-28 w-28 object-contain">
        <h2 class="text-base font-bold text-slate-900">Pengguna tidak ditemukan</h2>
        <p class="mt-1 text-sm text-slate-500">Coba ubah kata kunci atau filter role.</p>
      </div>
      <div v-else class="min-w-0 overflow-x-auto">
        <table class="w-full min-w-[680px] text-left text-sm">
          <thead class="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400"><tr><th class="px-3 py-3">Pengguna</th><th class="px-3 py-3">Role</th><th class="px-3 py-3">Status</th><th class="px-3 py-3">Terdaftar</th><th class="px-3 py-3 text-right">Aksi</th></tr></thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in users" :key="user.user_id" class="hover:bg-slate-50">
              <td class="px-3 py-4"><div class="flex items-center gap-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><UserRound class="h-5 w-5" /></div><div class="min-w-0"><p class="font-bold text-slate-900">{{ user.nama }}</p><p class="max-w-[240px] truncate text-xs text-slate-500">{{ user.email }}</p></div></div></td>
              <td class="px-3 py-4"><span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"><ShieldCheck class="h-3.5 w-3.5" />{{ getRoleLabel(user.role) }}</span></td>
              <td class="px-3 py-4"><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" :class="user.is_activate ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">{{ user.is_activate ? 'Aktif' : 'Belum Aktif' }}</span></td>
              <td class="px-3 py-4 text-xs font-medium text-slate-500">{{ formatDate(user.created_at) }}</td>
              <td class="px-3 py-4"><div class="flex justify-end gap-1"><button type="button" :aria-label="`Edit ${user.nama}`" class="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600" @click="openEdit(user)"><Pencil class="h-4 w-4" /></button><button type="button" :aria-label="`Hapus ${user.nama}`" :disabled="Number(authStore.user?.user_id) === user.user_id" class="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40" @click="deleteTarget = user"><Trash2 class="h-4 w-4" /></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && total > 0" class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
        <span>Menampilkan {{ firstRow }}–{{ lastRow }} dari {{ total }} user</span>
        <div class="flex items-center gap-2"><button type="button" aria-label="Halaman sebelumnya" class="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40" :disabled="page <= 1" @click="page--"><ChevronLeft class="h-4 w-4" /></button><span>Halaman {{ page }} / {{ totalPages }}</span><button type="button" aria-label="Halaman berikutnya" class="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40" :disabled="page >= totalPages" @click="page++"><ChevronRight class="h-4 w-4" /></button></div>
      </div>
    </div>

    <div v-if="showForm" class="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden overscroll-contain bg-slate-950/50 p-4" @click.self="showForm = false">
      <div role="dialog" aria-modal="true" :aria-label="isEditing ? 'Edit user' : 'Tambah user'" class="max-h-[90dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
        <div class="mb-5 flex items-center justify-between"><h2 class="text-xl font-extrabold text-slate-900">{{ isEditing ? 'Edit User' : 'Tambah User' }}</h2><button type="button" aria-label="Tutup formulir" class="rounded-xl p-2 text-slate-500 hover:bg-slate-100" @click="showForm = false"><X class="h-5 w-5" /></button></div>
        <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="saveUser">
          <label class="text-xs font-bold text-slate-700 sm:col-span-2">Nama Lengkap <input v-model="form.nama" required maxlength="150" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"></label>
          <label class="text-xs font-bold text-slate-700 sm:col-span-2">Email <input v-model="form.email" type="email" required maxlength="150" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"></label>
          <label class="text-xs font-bold text-slate-700">Nomor HP <input v-model="form.no_hp" type="tel" maxlength="30" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"></label>
          <label class="text-xs font-bold text-slate-700">Gender <select v-model="form.gender" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"><option value="">Belum diisi</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label>
          <label class="text-xs font-bold text-slate-700">Role <select v-model.number="form.role" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"><option :value="1">Admin</option><option :value="2">Siswa</option><option :value="3">Tutor</option></select></label>
          <label class="text-xs font-bold text-slate-700">{{ isEditing ? 'Password Baru (opsional)' : 'Password' }} <input v-model="form.password" type="password" :required="!isEditing" minlength="8" autocomplete="new-password" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"></label>
          <label class="flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2"><input v-model="form.is_activate" type="checkbox" class="h-4 w-4 accent-blue-600"> Akun aktif</label>
          <p v-if="error" role="alert" class="flex items-center gap-2 text-sm font-semibold text-red-600 sm:col-span-2"><AlertCircle class="h-4 w-4" />{{ error }}</p>
          <div class="flex justify-end gap-2 sm:col-span-2"><button type="button" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50" @click="showForm = false">Batal</button><button type="submit" :disabled="saving" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"><LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />{{ isEditing ? 'Simpan Perubahan' : 'Buat User' }}</button></div>
        </form>
      </div>
    </div>

    <div v-if="deleteTarget" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" @click.self="deleteTarget = null">
      <div role="alertdialog" aria-modal="true" aria-label="Konfirmasi hapus user" class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 class="text-lg font-extrabold text-slate-900">Hapus pengguna?</h2><p class="mt-2 text-sm text-slate-500">Akun <strong>{{ deleteTarget.nama }}</strong> akan dihapus permanen.</p><p v-if="error" role="alert" class="mt-3 text-sm font-semibold text-red-600">{{ error }}</p><div class="mt-6 flex justify-end gap-2"><button type="button" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600" @click="deleteTarget = null">Batal</button><button type="button" :disabled="deleting" class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60" @click="deleteUser"><LoaderCircle v-if="deleting" class="h-4 w-4 animate-spin" />Hapus User</button></div></div>
    </div>
  </div>
</template>
