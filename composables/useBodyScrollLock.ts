import { onBeforeUnmount, watch, type Ref } from 'vue';
export function useBodyScrollLock(active: Ref<boolean>) {
  let previousOverflow = '';
  watch(active, (locked) => {
    if (!import.meta.client) return;
    if (locked) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = previousOverflow;
  }, { immediate: true });
  onBeforeUnmount(() => { if (import.meta.client) document.body.style.overflow = previousOverflow; });
}
