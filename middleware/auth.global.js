import { useAuthStore } from "~/stores/api/auth";

const publicRoutes = new Set(["/login", "/register", "/about"]);
const authRoutes = new Set(["/login", "/register"]);

export default defineNuxtRouteMiddleware(async (to) => {
  // Sesi disimpan di localStorage, jadi restore dilakukan setelah masuk client.
  if (import.meta.server) return;

  const authStore = useAuthStore();
  const authenticated = await authStore.restoreAuth();

  if (to.path === "/") {
    return navigateTo(authenticated ? "/dashboard" : "/login", {
      replace: true,
    });
  }

  if (authRoutes.has(to.path) && authenticated) {
    return navigateTo("/dashboard", { replace: true });
  }

  if (!publicRoutes.has(to.path) && !authenticated) {
    return navigateTo("/login", { replace: true });
  }
});
