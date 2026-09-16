import { useAuthStore } from "~/stores/api/auth";

export default defineNuxtRouteMiddleware(async () => {
  // Token disimpan di localStorage, sehingga validasinya hanya dilakukan di client.
  // SSR tetap merender state loading dashboard, bukan data fallback.
  if (process.server || import.meta.server) return;

  const authStore = useAuthStore();
  const authenticated = await authStore.restoreAuth();

  if (!authenticated) return navigateTo("/login");
});
