<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileClock,
  FilePlus2,
  FileText,
  Files,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-vue-next";
import { useAuthStore } from "~/stores/api/auth";
import { useMaterialsStore } from "~/stores/api/materials";
import { canAccessPage, ROLES } from "~/utils/roles";
import { useBodyScrollLock } from "~/composables/useBodyScrollLock";

type Material = {
  id: number;
  title: string;
  description?: string | null;
  subtest: string;
  category: string;
  subtests?: Array<{ code: string; name: string }>;
  categories?: Array<{ id: number; subtest: string; name: string }>;
  status: "active" | "draft";
  file_name: string;
  file_mime: string;
  file_size: number;
  created_at?: string;
  created_by?: { nama: string };
};
const authStore = useAuthStore();
const store = useMaterialsStore();
const ready = ref(false);
const showForm = ref(false);
useBodyScrollLock(showForm);
const editing = ref<Material | null>(null);
const deleteTarget = ref<Material | null>(null);
const actionError = ref("");
const notice = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);
const fileBusy = ref<number | null>(null);
const selectedIds = ref<Set<number>>(new Set());
const selectionScope = ref<'page' | 'filter' | 'all'>('page');
const bulkDialog = ref<{ selection: 'ids' | 'filter' | 'all'; count: number } | null>(null);
const confirmationText = ref('');
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const form = reactive({
  title: "",
  description: "",
  subtests: [] as string[],
  category_ids: [] as number[],
  status: "draft",
});
const subtests = [
  { code: "PU", label: "Penalaran Umum" },
  { code: "PPU", label: "Pengetahuan dan Pemahaman Umum" },
  { code: "PBM", label: "Pemahaman Bacaan dan Menulis" },
  { code: "PK", label: "Pengetahuan Kuantitatif" },
  { code: "LBI", label: "Literasi Bahasa Indonesia" },
  { code: "LBE", label: "Literasi Bahasa Inggris" },
  { code: "PM", label: "Penalaran Matematika" },
];
const cards = computed(() => [
  {
    label: "Total Materi",
    value: store.summary.total,
    icon: Files,
    tone: "bg-pale-blue text-primary-container",
  },
  {
    label: "Materi Aktif",
    value: store.summary.active,
    icon: BookOpen,
    tone: "bg-success-soft text-success-emerald",
  },
  {
    label: "Draft",
    value: store.summary.draft,
    icon: FileClock,
    tone: "bg-soft-orange text-on-secondary-container",
  },
]);
const startRow = computed(() =>
  store.pagination.total
    ? (store.pagination.page - 1) * store.pagination.limit + 1
    : 0,
);
const endRow = computed(() =>
  Math.min(
    store.pagination.page * store.pagination.limit,
    store.pagination.total,
  ),
);
const pageIds = computed(() => store.materials.map((item: Material) => Number(item.id)));
const pageSelected = computed(() => pageIds.value.length > 0 && pageIds.value.every((id) => selectedIds.value.has(id)));
const selectedCount = computed(() => selectionScope.value === 'page' ? selectedIds.value.size : store.pagination.total);
const hasFilters = computed(() => Object.values(store.filters).some((value) => String(value).trim()));

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
}
function formatSize(size: number) {
  return size >= 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`;
}
function resetForm() {
  Object.assign(form, {
    title: "",
    description: "",
    subtests: [],
    category_ids: [],
    status: "draft",
  });
  editing.value = null;
  file.value = null;
  actionError.value = "";
  if (fileInput.value) fileInput.value.value = "";
}
function openCreate() {
  resetForm();
  store.categoryOptions = [];
  showForm.value = true;
}
function openEdit(item: Material) {
  resetForm();
  editing.value = item;
  Object.assign(form, {
    title: item.title,
    description: item.description ?? "",
    subtests: item.subtests?.map((entry) => entry.code) ?? [item.subtest],
    category_ids: item.categories?.map((entry) => entry.id) ?? (item.category_id ? [item.category_id] : []),
    status: item.status,
  });
  subtestsChanged();
  showForm.value = true;
}
const groupedCategories = computed(() => Object.fromEntries(form.subtests.map((code) => [code, store.categoryOptions.filter((item: any) => item.subtest === code)])));
const isAllCategoriesSelected = computed(() => store.categoryOptions.length > 0 && store.categoryOptions.every((item: any) => form.category_ids.includes(Number(item.id))));
let categoryRefreshId = 0;
async function subtestsChanged() {
  const current = ++categoryRefreshId;
  await store.fetchCategoryOptions(form.subtests);
  if (current !== categoryRefreshId) return;
  const allowed = new Set(store.categoryOptions.map((item: any) => Number(item.id)));
  form.category_ids = form.category_ids.filter((id) => allowed.has(Number(id)));
}
function toggleSubtest(code: string, checked: boolean) {
  form.subtests = checked ? [...new Set([...form.subtests, code])] : form.subtests.filter((item) => item !== code);
  subtestsChanged();
}
function toggleCategory(id: number, checked: boolean) { form.category_ids = checked ? [...new Set([...form.category_ids, id])] : form.category_ids.filter((item) => item !== id); }
function toggleCategoryGroup(code: string, checked: boolean) {
  const ids = (groupedCategories.value[code] || []).map((item: any) => Number(item.id));
  form.category_ids = checked ? [...new Set([...form.category_ids, ...ids])] : form.category_ids.filter((id) => !ids.includes(id));
}
function toggleAllCategories(checked: boolean) { form.category_ids = checked ? store.categoryOptions.map((item: any) => Number(item.id)) : []; }
function chooseFile(event: Event) {
  actionError.value = "";
  const selected = (event.target as HTMLInputElement).files?.[0] ?? null;
  if (selected && selected.size > 20 * 1024 * 1024) {
    actionError.value = "Ukuran file maksimal 20 MB.";
    file.value = null;
    return;
  }
  file.value = selected;
}
async function refresh() {
  await Promise.all([store.fetchMaterials(), store.fetchSummary()]);
}
function clearSelection() { selectedIds.value = new Set(); selectionScope.value = 'page'; bulkDialog.value = null; confirmationText.value = ''; }
function applyFilter() {
  clearSelection();
  store.pagination.page = 1;
  store.fetchMaterials();
}
function toggleOne(id: number, checked: boolean) { const next = new Set(selectedIds.value); checked ? next.add(id) : next.delete(id); selectedIds.value = next; selectionScope.value = 'page'; }
function togglePage(checked: boolean) { const next = new Set(selectedIds.value); for (const id of pageIds.value) checked ? next.add(id) : next.delete(id); selectedIds.value = next; selectionScope.value = 'page'; }
function selectAllMatching() { selectedIds.value = new Set(); selectionScope.value = hasFilters.value ? 'filter' : 'all'; }
function openBulkDelete(selection?: 'ids' | 'filter' | 'all') { const resolved = selection || (selectionScope.value === 'page' ? 'ids' : selectionScope.value); const count = resolved === 'ids' ? selectedIds.value.size : store.pagination.total; if (!count) return; confirmationText.value = ''; actionError.value = ''; bulkDialog.value = { selection: resolved, count }; }
function filterSummary() { return [store.filters.subtest && `Subtes: ${store.filters.subtest}`, store.filters.category && `Kategori: ${store.filters.category}`, store.filters.status && `Status: ${store.filters.status}`, store.filters.search && `Pencarian: “${store.filters.search}”`].filter(Boolean).join(' · '); }
async function confirmBulkDelete() {
  if (!bulkDialog.value || store.isSubmitting || (bulkDialog.value.selection === 'all' && confirmationText.value !== 'HAPUS')) return;
  actionError.value = ''; notice.value = '';
  try {
    const body = bulkDialog.value.selection === 'ids' ? { selection: 'ids', ids: [...selectedIds.value] } : bulkDialog.value.selection === 'filter' ? { selection: 'filter', filters: { ...store.filters } } : { selection: 'all', confirmation: confirmationText.value };
    const response = await store.bulkDelete(body); const deleted = Number(response?.data?.deleted || bulkDialog.value.count);
    bulkDialog.value = null; clearSelection(); notice.value = `${deleted} materi berhasil dihapus.`;
    await refresh(); if (store.pagination.page > store.pagination.totalPages) { store.pagination.page = store.pagination.totalPages; await store.fetchMaterials(); }
  } catch { actionError.value = store.error || 'Gagal menghapus materi.'; store.error = ''; }
}
function changePage(next: number) {
  if (next < 1 || next > store.pagination.totalPages) return;
  store.pagination.page = next;
  store.fetchMaterials();
}
async function save() {
  if (store.isSubmitting) return;
  actionError.value = "";
  if (!form.subtests.length || !form.category_ids.length) { actionError.value = "Pilih minimal satu subtes dan satu kategori."; return; }
  if (!file.value && !editing.value) {
    actionError.value = "Pilih file materi terlebih dahulu.";
    return;
  }
  const body = new FormData();
  body.append('title', form.title); body.append('description', form.description); body.append('status', form.status);
  body.append('subtests', JSON.stringify(form.subtests)); body.append('category_ids', JSON.stringify(form.category_ids));
  if (file.value) body.append("file", file.value);
  try {
    if (editing.value) await store.updateMaterial(editing.value.id, body);
    else await store.createMaterial(body);
    notice.value = editing.value
      ? "Materi berhasil diperbarui."
      : "Materi berhasil ditambahkan.";
    showForm.value = false;
    resetForm();
    await refresh();
  } catch {
    actionError.value = store.error || "Gagal menyimpan materi.";
    store.error = "";
  }
}
async function remove() {
  if (!deleteTarget.value || store.isSubmitting) return;
  actionError.value = "";
  try {
    await store.deleteMaterial(deleteTarget.value.id);
    deleteTarget.value = null;
    notice.value = "Materi berhasil dihapus.";
    if (store.materials.length === 1 && store.pagination.page > 1)
      store.pagination.page -= 1;
    await refresh();
  } catch {
    actionError.value = store.error || "Gagal menghapus materi.";
    store.error = "";
  }
}
async function openFile(item: Material) {
  const isPdf = item.file_mime === "application/pdf";
  const tab = isPdf ? window.open("", "_blank") : null;
  fileBusy.value = item.id;
  actionError.value = "";
  try {
    const blob = await store.fetchFile(item.id);
    const url = URL.createObjectURL(blob);
    if (tab) tab.location.href = url;
    else {
      const link = document.createElement("a");
      link.href = url;
      link.download = item.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error: any) {
    tab?.close();
    actionError.value = error?.message || "Gagal membuka file materi.";
  } finally {
    fileBusy.value = null;
  }
}

watch(
  () => store.filters.search,
  () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilter, 350);
  },
);
onBeforeUnmount(() => clearTimeout(searchTimer));
onMounted(async () => {
  authStore.initializeAuth();
  if (!authStore.token) return navigateTo("/login");
  const user = await authStore.fetchCurrentUser();
  if (
    Number(user?.role) !== ROLES.ADMIN ||
    !canAccessPage(user?.role, "materials")
  )
    return navigateTo("/dashboard");
  ready.value = true;
  await refresh();
});
</script>

<template>
  <div
    v-if="ready"
    class="mx-auto w-full max-w-[1536px] min-w-0 px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10"
  >
    <header class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-headline-md text-headline-md text-on-surface">
          Materi
        </h1>
        <p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          Kelola dokumen belajar MatrIQ.
        </p>
      </div>
      <button
        v-if="canAccessPage(authStore.user?.role, 'materials.create')"
        type="button"
        class="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white hover:bg-brand-700"
        @click="openCreate"
      >
        <Plus class="h-4 w-4" />Tambah Materi
      </button>
    </header>
    <section
      class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
      aria-label="Ringkasan materi"
    >
      <article
        v-for="card in cards"
        :key="card.label"
        class="rounded-3xl border border-soft-blue bg-surface-white p-5 shadow-sm"
      >
        <div
          class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl"
          :class="card.tone"
        >
          <component :is="card.icon" class="h-[22px] w-[22px]" />
        </div>
        <p class="font-caption text-caption text-outline">{{ card.label }}</p>
        <div
          v-if="store.isLoading"
          class="mt-2 h-8 w-16 animate-pulse rounded-lg bg-surface-container"
        />
        <p
          v-else
          class="mt-1 font-headline-md text-headline-md text-on-surface"
        >
          {{ card.value ?? "—" }}
        </p>
      </article>
    </section>
    <section
      class="min-w-0 rounded-3xl border border-soft-blue bg-surface-white p-4 shadow-sm sm:p-6"
    >
      <div
        class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(2,minmax(150px,auto))_auto]"
      >
        <label class="relative min-w-0"
          ><Search
            class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" /><input
            v-model="store.filters.search"
            type="search"
            placeholder="Cari materi..."
            class="w-full rounded-2xl border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-3 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary-container" /></label
        ><select
          v-model="store.filters.subtest"
          aria-label="Filter subtes"
          class="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"
          @change="applyFilter"
        >
          <option value="">Pilih filter subtes</option>
          <option v-for="item in subtests" :key="item.code" :value="item.code">
            {{ item.label }}
          </option></select
        ><select
          v-model="store.filters.status"
          aria-label="Filter status"
          class="rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"
          @change="applyFilter"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="draft">Draft</option></select
        ><button
          type="button"
          aria-label="Muat ulang materi"
          class="inline-flex items-center justify-center rounded-2xl border border-outline-variant px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-low"
          :disabled="store.isLoading"
          @click="refresh"
        >
          <RefreshCw
            class="h-4 w-4"
            :class="store.isLoading ? 'animate-spin' : ''"
          />
        </button>
      </div>
      <select
        v-model="store.filters.category"
        aria-label="Filter kategori"
        :disabled="!store.categories.length"
        class="mb-5 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm disabled:opacity-50 sm:w-auto"
        @change="applyFilter"
      >
        <option value="">
          {{
            store.categories.length
              ? "Semua Kategori"
              : "Kategori belum tersedia"
          }}
        </option>
        <option
          v-for="item in store.categories"
          :key="item.id"
          :value="item.id"
        >
          {{ item.name }}
        </option>
      </select>
      <div v-if="store.materials.length" class="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-soft-blue bg-surface-container-low px-4 py-3 text-sm"><label class="flex items-center gap-2 font-semibold"><input type="checkbox" :checked="pageSelected" @change="togglePage(($event.target as HTMLInputElement).checked)">Pilih halaman ini</label><template v-if="pageSelected && store.pagination.total > pageIds.length && selectionScope === 'page'"><span>{{ pageIds.length }} materi di halaman ini dipilih.</span><button type="button" class="font-semibold text-primary-container underline" @click="selectAllMatching">Pilih semua {{ store.pagination.total }} materi {{ hasFilters ? 'sesuai filter' : '' }}</button></template><template v-if="selectedCount"><strong class="ml-auto">{{ selectedCount }} materi dipilih</strong><button type="button" class="rounded-xl bg-danger-rose px-3 py-2 font-semibold text-white" :disabled="store.isSubmitting" @click="openBulkDelete()">Hapus Terpilih</button><button type="button" class="rounded-xl border border-soft-blue px-3 py-2" @click="clearSelection">Batal Pilih</button></template><button v-else type="button" class="ml-auto rounded-xl border border-danger-rose px-3 py-2 font-semibold text-danger-rose" @click="openBulkDelete('all')">Hapus Seluruh Materi</button></div>
      <p
        v-if="notice"
        role="status"
        class="mb-4 flex items-center gap-2 rounded-2xl bg-success-soft px-4 py-3 font-body-sm text-body-sm text-success-emerald"
      >
        <Check class="h-4 w-4" />{{ notice }}
      </p>
      <p
        v-if="actionError && !showForm && !deleteTarget"
        role="alert"
        class="mb-4 flex items-center gap-2 rounded-2xl bg-danger-soft px-4 py-3 font-body-sm text-body-sm text-danger-rose"
      >
        <AlertCircle class="h-4 w-4" />{{ actionError }}
      </p>
      <div v-if="store.isLoading" class="space-y-3" aria-label="Memuat materi">
        <div
          v-for="n in 5"
          :key="n"
          class="h-16 animate-pulse rounded-2xl bg-surface-container-low"
        />
      </div>
      <div
        v-else-if="store.error"
        role="alert"
        class="flex flex-col items-center py-12 text-center"
      >
        <AlertCircle class="mb-3 h-9 w-9 text-danger-rose" />
        <h2 class="font-title-md text-title-md text-on-surface">
          Gagal memuat materi
        </h2>
        <p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          {{ store.error }}
        </p>
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white"
          @click="refresh"
        >
          <RefreshCw class="h-4 w-4" />Coba Lagi
        </button>
      </div>
      <div
        v-else-if="!store.materials.length"
        class="flex flex-col items-center py-12 text-center"
      >
        <FilePlus2 class="mb-3 h-10 w-10 text-primary-container" />
        <h2 class="font-title-md text-title-md text-on-surface">
          Belum ada materi
        </h2>
        <p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          Unggah materi pertama untuk Bank Materi MatrIQ.
        </p>
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white"
          @click="openCreate"
        >
          <Plus class="h-4 w-4" />Tambah Materi
        </button>
      </div>
      <template v-else
        ><div class="hidden min-w-0 overflow-x-auto md:block">
          <table
            class="w-full min-w-[750px] text-left font-body-sm text-body-sm"
          >
            <thead
              class="border-b border-soft-blue font-caption text-caption text-outline"
            >
              <tr>
                <th class="px-3 py-3"><input type="checkbox" aria-label="Pilih semua materi di halaman" :checked="pageSelected" @change="togglePage(($event.target as HTMLInputElement).checked)"></th>
                <th class="px-3 py-3">Materi</th>
                <th class="px-3 py-3">Subtes</th>
                <th class="px-3 py-3">Kategori</th>
                <th class="px-3 py-3">Format</th>
                <th class="px-3 py-3">Status</th>
                <th class="px-3 py-3">Tanggal</th>
                <th class="px-3 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-soft-blue">
              <tr
                v-for="item in store.materials"
                :key="item.id"
                class="hover:bg-surface-container-low"
              >
                <td class="px-3 py-4"><input type="checkbox" :aria-label="`Pilih ${item.title}`" :checked="selectedIds.has(Number(item.id))" @change="toggleOne(Number(item.id), ($event.target as HTMLInputElement).checked)"></td>
                <td class="max-w-[270px] px-3 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pale-blue text-primary-container"
                    >
                      <FileText class="h-5 w-5" />
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-semibold text-on-surface">
                        {{ item.title }}
                      </p>
                      <p
                        class="truncate font-caption text-caption text-outline"
                      >
                        {{ item.file_name }} · {{ formatSize(item.file_size) }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-4 text-on-surface-variant">
                  {{ item.subtests?.map(entry => entry.code).join(', ') || item.subtest }}
                </td>
                <td class="px-3 py-4 text-on-surface-variant">
                  {{ item.categories?.[0]?.name || item.category }}<template v-if="(item.categories?.length || 0) > 1"> +{{ item.categories!.length - 1 }}</template>
                </td>
                <td class="px-3 py-4 text-on-surface-variant">
                  {{ item.file_name.split(".").pop()?.toUpperCase() }}
                </td>
                <td class="px-3 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 font-caption text-caption"
                    :class="
                      item.status === 'active'
                        ? 'bg-success-soft text-success-emerald'
                        : 'bg-surface-container text-outline'
                    "
                    >{{ item.status === "active" ? "Aktif" : "Draft" }}</span
                  >
                </td>
                <td class="px-3 py-4 text-on-surface-variant">
                  {{ formatDate(item.created_at) }}
                </td>
                <td class="relative px-3 py-4">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      :aria-label="`Buka ${item.title}`"
                      :disabled="fileBusy === item.id"
                      class="rounded-xl p-2 text-primary-container hover:bg-pale-blue disabled:opacity-50"
                      @click="openFile(item)"
                    >
                      <LoaderCircle
                        v-if="fileBusy === item.id"
                        class="h-4 w-4 animate-spin"
                      /><Eye v-else class="h-4 w-4" /></button
                    ><button
                      type="button"
                      :aria-label="`Edit ${item.title}`"
                      class="rounded-xl p-2 text-on-surface-variant hover:bg-surface-container"
                      @click="openEdit(item)"
                    >
                      <Pencil class="h-4 w-4" /></button
                    ><button
                      type="button"
                      :aria-label="`Hapus ${item.title}`"
                      class="rounded-xl p-2 text-danger-rose hover:bg-danger-soft"
                      @click="
                        deleteTarget = item;
                        actionError = '';
                      "
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="space-y-3 md:hidden">
          <article
            v-for="item in store.materials"
            :key="item.id"
            class="rounded-2xl border border-soft-blue p-4"
          >
            <div class="flex items-start gap-3"><input type="checkbox" class="mt-1" :aria-label="`Pilih ${item.title}`" :checked="selectedIds.has(Number(item.id))" @change="toggleOne(Number(item.id), ($event.target as HTMLInputElement).checked)">
              <FileText class="h-6 w-6 shrink-0 text-primary-container" />
              <div class="min-w-0 flex-1">
                <h3
                  class="truncate font-label-md text-label-md text-on-surface"
                >
                  {{ item.title }}
                </h3>
                <p class="mt-1 truncate font-caption text-caption text-outline">
                  {{ item.file_name }} · {{ formatSize(item.file_size) }}
                </p>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-2 font-caption text-caption">
              <span
                class="rounded-full bg-pale-blue px-2.5 py-1 text-primary-container"
                >{{ item.subtests?.map(entry => entry.code).join(', ') || item.subtest }}</span
              ><span
                class="rounded-full bg-surface-container px-2.5 py-1 text-outline"
                >{{ item.categories?.[0]?.name || item.category }}<template v-if="(item.categories?.length || 0) > 1"> +{{ item.categories!.length - 1 }}</template></span
              ><span
                class="rounded-full px-2.5 py-1"
                :class="
                  item.status === 'active'
                    ? 'bg-success-soft text-success-emerald'
                    : 'bg-surface-container text-outline'
                "
                >{{ item.status === "active" ? "Aktif" : "Draft" }}</span
              >
            </div>
            <div class="mt-3 flex gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-xl border border-soft-blue px-3 py-2 font-caption text-caption"
                @click="openFile(item)"
              >
                <Download class="h-4 w-4" />Buka</button
              ><button
                type="button"
                class="inline-flex items-center gap-1 rounded-xl border border-soft-blue px-3 py-2 font-caption text-caption"
                @click="openEdit(item)"
              >
                <Pencil class="h-4 w-4" />Edit</button
              ><button
                type="button"
                class="inline-flex items-center gap-1 rounded-xl border border-soft-blue px-3 py-2 font-caption text-caption text-danger-rose"
                @click="
                  deleteTarget = item;
                  actionError = '';
                "
              >
                <Trash2 class="h-4 w-4" />Hapus
              </button>
            </div>
          </article>
        </div>
        <div
          class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-soft-blue pt-4 font-caption text-caption text-outline"
        >
          <span
            >Menampilkan {{ startRow }}–{{ endRow }} dari
            {{ store.pagination.total }} materi</span
          >
          <div class="flex items-center gap-2">
            <button
              type="button"
              aria-label="Halaman sebelumnya"
              class="rounded-xl border border-soft-blue p-2 disabled:opacity-40"
              :disabled="store.pagination.page <= 1"
              @click="changePage(store.pagination.page - 1)"
            >
              <ChevronLeft class="h-4 w-4" /></button
            ><span
              >Halaman {{ store.pagination.page }} /
              {{ store.pagination.totalPages }}</span
            ><button
              type="button"
              aria-label="Halaman berikutnya"
              class="rounded-xl border border-soft-blue p-2 disabled:opacity-40"
              :disabled="store.pagination.page >= store.pagination.totalPages"
              @click="changePage(store.pagination.page + 1)"
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div></div
      ></template>
    </section>
    <div
      v-if="showForm"
      class="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden overscroll-contain bg-slate-950/50 p-4"
      @click.self="showForm = false"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="editing ? 'Edit materi' : 'Tambah materi'"
        class="max-h-[90dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div class="mb-5 flex items-center justify-between">
          <h2 class="font-title-md text-title-md text-on-surface">
            {{ editing ? "Edit Materi" : "Tambah Materi" }}
          </h2>
          <button
            type="button"
            aria-label="Tutup formulir"
            class="rounded-xl p-2 text-on-surface-variant"
            @click="showForm = false"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <form class="space-y-4" @submit.prevent="save">
          <label class="block font-label-sm text-label-sm text-on-surface"
            >Judul<input
              v-model="form.title"
              required
              minlength="3"
              maxlength="200"
              class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"
          /></label>
          <fieldset class="rounded-2xl border border-outline-variant p-4"><legend class="px-1 font-label-sm text-label-sm text-on-surface">Subtes</legend>
            <div class="grid gap-2 sm:grid-cols-2"><label v-for="item in subtests" :key="item.code" class="flex min-h-11 items-center gap-3 rounded-xl bg-surface-container-low px-3 py-2"><input type="checkbox" :checked="form.subtests.includes(item.code)" class="h-4 w-4 accent-primary-container" @change="toggleSubtest(item.code, ($event.target as HTMLInputElement).checked)"><span><strong class="block">{{ item.code }}</strong><small class="text-outline">{{ item.label }}</small></span></label></div>
          </fieldset>
          <fieldset class="rounded-2xl border border-outline-variant p-4"><legend class="px-1 font-label-sm text-label-sm text-on-surface">Kategori</legend>
            <p v-if="!form.subtests.length" class="text-sm text-on-surface-variant">Pilih minimal satu subtes untuk menampilkan kategori.</p>
            <template v-else><label class="mb-3 flex min-h-11 items-center gap-3 border-b border-soft-blue pb-3"><input type="checkbox" :checked="isAllCategoriesSelected" class="h-4 w-4 accent-primary-container" @change="toggleAllCategories(($event.target as HTMLInputElement).checked)"><strong>Semua Kategori</strong></label>
              <p v-if="store.isLoadingCategories" class="text-sm text-on-surface-variant">Memuat kategori...</p><p v-else-if="store.categoryError" class="text-sm text-danger-rose">{{ store.categoryError }}</p>
              <div v-else class="space-y-4"><section v-for="code in form.subtests" :key="code" class="rounded-xl bg-surface-container-low p-3"><div class="mb-2"><strong>{{ code }}</strong><span class="ml-2 text-xs text-outline">{{ subtests.find(item => item.code === code)?.label }}</span></div><p v-if="!groupedCategories[code]?.length" class="text-xs text-outline">Belum ada kategori untuk subtes ini.</p><template v-else><label class="flex min-h-10 items-center gap-2 font-medium"><input type="checkbox" :checked="groupedCategories[code].every((item:any) => form.category_ids.includes(Number(item.id)))" class="h-4 w-4 accent-primary-container" @change="toggleCategoryGroup(code, ($event.target as HTMLInputElement).checked)">Semua Kategori {{ code }}</label><div class="grid gap-1 sm:grid-cols-2"><label v-for="item in groupedCategories[code]" :key="item.id" class="flex min-h-10 items-center gap-2"><input type="checkbox" :checked="form.category_ids.includes(Number(item.id))" class="h-4 w-4 accent-primary-container" @change="toggleCategory(Number(item.id), ($event.target as HTMLInputElement).checked)">{{ item.name }}</label></div></template></section></div>
            </template>
          </fieldset>
          <label class="block font-label-sm text-label-sm text-on-surface"
            >Deskripsi<textarea
              v-model="form.description"
              maxlength="10000"
              rows="3"
              class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"
            /></label
          ><label class="block font-label-sm text-label-sm text-on-surface"
            >Status<select
              v-model="form.status"
              class="mt-1 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Aktif</option>
            </select></label
          ><label
            class="block rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-4 font-label-sm text-label-sm text-on-surface"
            ><span class="flex items-center gap-2"
              ><UploadCloud class="h-5 w-5 text-primary-container" />{{
                editing ? "Ganti File (opsional)" : "Unggah File"
              }}</span
            ><input
              ref="fileInput"
              type="file"
              :required="!editing"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              class="mt-3 block w-full font-body-sm text-body-sm text-on-surface-variant"
              @change="chooseFile"
            /><span class="mt-2 block font-caption text-caption text-outline"
              >PDF, Word, PowerPoint, Excel, atau TXT · maks. 20 MB</span
            ><span
              v-if="editing && !file"
              class="mt-1 block font-caption text-caption text-outline"
              >File saat ini: {{ editing.file_name }}</span
            ></label
          >
          <p
            v-if="actionError"
            role="alert"
            class="font-body-sm text-body-sm text-danger-rose"
          >
            {{ actionError }}
          </p>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="rounded-xl border border-soft-blue px-4 py-2.5 font-label-sm text-label-sm"
              @click="showForm = false"
            >
              Batal</button
            ><button
              type="submit"
              :disabled="store.isSubmitting"
              class="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 font-label-sm text-label-sm text-white disabled:opacity-60"
            >
              <LoaderCircle
                v-if="store.isSubmitting"
                class="h-4 w-4 animate-spin"
              /><Plus v-else class="h-4 w-4" />{{
                editing ? "Simpan Perubahan" : "Simpan Materi"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <div
      v-if="deleteTarget"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
      @click.self="deleteTarget = null"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Konfirmasi hapus materi"
        class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <h2 class="font-title-md text-title-md text-on-surface">
          Hapus materi?
        </h2>
        <p class="mt-2 font-body-sm text-body-sm text-on-surface-variant">
          Materi <strong>{{ deleteTarget.title }}</strong> beserta filenya akan
          dihapus permanen.
        </p>
        <p
          v-if="actionError"
          role="alert"
          class="mt-3 font-body-sm text-body-sm text-danger-rose"
        >
          {{ actionError }}
        </p>
        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl border border-soft-blue px-4 py-2.5 font-label-sm text-label-sm"
            @click="deleteTarget = null"
          >
            Batal</button
          ><button
            type="button"
            :disabled="store.isSubmitting"
            class="inline-flex items-center gap-2 rounded-xl bg-danger-rose px-4 py-2.5 font-label-sm text-label-sm text-white disabled:opacity-60"
            @click="remove"
          >
            <LoaderCircle
              v-if="store.isSubmitting"
              class="h-4 w-4 animate-spin"
            />Hapus Materi
          </button>
        </div>
      </div>
    </div>
    <div v-if="bulkDialog" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" @click.self="!store.isSubmitting && (bulkDialog = null)"><div role="alertdialog" aria-modal="true" aria-label="Konfirmasi bulk delete materi" class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 class="font-title-md text-title-md">{{ bulkDialog.selection === 'all' ? 'Hapus seluruh Materi?' : `Hapus ${bulkDialog.count} materi?` }}</h2><p class="mt-2 text-sm text-on-surface-variant">{{ bulkDialog.selection === 'filter' ? `Hanya materi sesuai filter berikut yang akan dihapus: ${filterSummary()}.` : bulkDialog.selection === 'all' ? 'Tindakan ini mencakup seluruh Materi. Materi yang masih digunakan tidak akan dapat dihapus.' : 'Hanya materi yang dipilih akan dihapus. Operasi dibatalkan seluruhnya jika salah satu masih digunakan.' }}</p><label v-if="bulkDialog.selection === 'all'" class="mt-4 block text-sm font-semibold">Ketik HAPUS untuk melanjutkan<input v-model="confirmationText" autocomplete="off" class="mt-1 w-full rounded-xl border border-outline-variant px-3 py-2"></label><p v-if="actionError" class="mt-3 text-sm text-danger-rose">{{ actionError }}</p><div class="mt-6 flex justify-end gap-2"><button type="button" :disabled="store.isSubmitting" class="rounded-xl border border-soft-blue px-4 py-2.5" @click="bulkDialog = null">Batal</button><button type="button" :disabled="store.isSubmitting || (bulkDialog.selection === 'all' && confirmationText !== 'HAPUS')" class="inline-flex items-center gap-2 rounded-xl bg-danger-rose px-4 py-2.5 font-semibold text-white disabled:opacity-50" @click="confirmBulkDelete"><LoaderCircle v-if="store.isSubmitting" class="h-4 w-4 animate-spin" />{{ store.isSubmitting ? `Menghapus ${bulkDialog.count} materi...` : `Hapus ${bulkDialog.count} Materi` }}</button></div></div></div>
  </div>
</template>
