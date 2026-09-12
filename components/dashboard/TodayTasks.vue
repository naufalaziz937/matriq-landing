<template>
  <div class="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-card card-hover-lift select-none" data-purpose="today-activities">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-bold text-slate-900">Dikerjakan Hari Ini</h3>
        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
          {{ completedCount }}/{{ tasks.length }}
        </span>
      </div>
      <button
        @click="showAddModal = true"
        class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Tambah</span>
      </button>
    </div>

    <!-- Task List -->
    <div class="space-y-2.5">
      <div
        v-for="task in tasks"
        :key="task.id"
        @click="$emit('toggle-task', task.id)"
        class="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100"
        :class="{ 'opacity-80 bg-slate-50/50': task.is_completed }"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105"
            :class="[task.bg_color || 'bg-blue-100', task.text_color || 'text-blue-700']"
          >
            {{ task.icon_symbol || '📚' }}
          </div>
          <div>
            <h5
              class="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors"
              :class="{ 'line-through text-slate-400': task.is_completed }"
            >
              {{ task.title }}
            </h5>
            <p class="text-[11px] text-slate-400 font-medium">
              {{ task.questions_count }} soal · {{ task.accuracy_pct }}%
            </p>
          </div>
        </div>

        <!-- Checkbox status pill -->
        <button
          class="w-6 h-6 rounded-full flex items-center justify-center transition-all"
          :class="[
            task.is_completed
              ? 'bg-teal-500 text-white shadow-sm scale-100'
              : 'border-2 border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50'
          ]"
        >
          <Check v-if="task.is_completed" class="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </div>

    <!-- Quick Add Task Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
      @click.self="showAddModal = false"
    >
      <div class="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-4 shadow-2xl sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-base font-bold text-slate-900">Tambah Target Hari Ini</h4>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleAddTask" class="space-y-3.5">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Materi / Subtes UTBK</label>
            <input
              v-model="newTask.title"
              type="text"
              required
              placeholder="Contoh: Fisika - Dinamika Gerak"
              class="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Jumlah Soal</label>
              <input
                v-model.number="newTask.questions_count"
                type="number"
                min="1"
                max="100"
                class="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Target Akurasi (%)</label>
              <input
                v-model.number="newTask.accuracy_pct"
                type="number"
                min="0"
                max="100"
                class="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="pt-2 flex gap-2">
            <button
              type="button"
              @click="showAddModal = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700"
            >
              Simpan Target
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Check, X } from 'lucide-vue-next';

interface Task {
  id: number;
  title: string;
  questions_count: number;
  accuracy_pct: number;
  is_completed: boolean;
  icon_symbol?: string;
  bg_color?: string;
  text_color?: string;
}

const props = withDefaults(
  defineProps<{
    tasks?: Task[];
  }>(),
  {
    tasks: () => []
  }
);

const emit = defineEmits<{
  (e: 'toggle-task', id: number): void;
  (e: 'add-task', taskData: Partial<Task>): void;
}>();

const showAddModal = ref(false);
const newTask = ref({
  title: '',
  questions_count: 10,
  accuracy_pct: 75,
  icon_symbol: '⚡',
  bg_color: 'bg-amber-100',
  text_color: 'text-amber-700'
});

const completedCount = computed(() => {
  return props.tasks.filter((t) => t.is_completed).length;
});

function handleAddTask() {
  if (!newTask.value.title.trim()) return;
  emit('add-task', { ...newTask.value });
  newTask.value.title = '';
  showAddModal.value = false;
}
</script>
