import { inject, onScopeDispose, type InjectionKey, type Ref, type ShallowRef } from 'vue';

export interface PageShellActions {
  search?: (query: string) => void;
  openAiParser?: () => void;
  navigate?: (name: string) => void;
  dbConnected?: boolean;
}

export const appShellKey: InjectionKey<{
  actions: ShallowRef<PageShellActions>;
  searchQuery: Ref<string>;
}> = Symbol('app-shell');

// Pages register content actions; the persistent layout owns the navigation UI.
export function useAppShell(actions: PageShellActions) {
  const shell = inject(appShellKey);
  if (!shell) throw new Error('useAppShell requires the default layout');
  shell.actions.value = actions;
  actions.search?.(shell.searchQuery.value);
  onScopeDispose(() => {
    if (shell.actions.value === actions) shell.actions.value = {};
  });
  return shell;
}
