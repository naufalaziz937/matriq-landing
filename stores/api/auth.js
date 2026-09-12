import { defineStore } from "pinia";
export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);

  const isLoading = ref(false);
  const error = ref("");

  const isActivated = computed(() => user.value?.is_activate === true);

  // ======================================================
  // HELPERS
  // ======================================================

  function getApiBase() {
    const config = useRuntimeConfig();
    return config.public.apiBase || "http://localhost:4000/api";
  }

  function getSavedToken() {
    if (token.value) {
      return token.value;
    }

    if (!import.meta.client) {
      return null;
    }

    const savedToken =
      localStorage.getItem("token");

    if (savedToken) {
      token.value = savedToken;
    }

    return savedToken;
  }

  function saveAuth(data) {
    token.value = data?.token || null;
    user.value = data?.user || null;

    if (!import.meta.client) {
      return;
    }

    if (token.value) {
      localStorage.setItem(
        "token",
        token.value,
      );
    }

    if (user.value) {
      localStorage.setItem(
        "user",
        JSON.stringify(user.value),
      );
    }
  }

  // ======================================================
  // REGISTER
  // ======================================================

  async function register(payload) {
    isLoading.value = true;
    error.value = "";

    try {
      const response = await $fetch(
        "/auth/register",
        {
          baseURL: getApiBase(),
          method: "POST",
          body: payload,
        },
      );

      return {
        success: true,
        data: response?.data,
      };
    } catch (err) {
      console.error(
        "[AUTH STORE] REGISTER ERROR:",
        err,
      );

      error.value =
        err?.data?.message ||
        err?.message ||
        "Terjadi kesalahan saat membuat akun";

      return {
        success: false,
        message: error.value,
      };
    } finally {
      isLoading.value = false;
    }
  }

  // ======================================================
  // LOGIN
  // ======================================================

  async function login(email, password) {
    isLoading.value = true;
    error.value = "";

    try {
      const response = await $fetch(
        "/auth/login",
        {
          baseURL: getApiBase(),
          method: "POST",
          body: {
            email,
            password,
          },
        },
      );

      saveAuth(response?.data);

      return {
        success: true,
        data: response?.data,
      };
    } catch (err) {
      console.error(
        "[AUTH STORE] LOGIN ERROR:",
        err,
      );

      error.value =
        err?.data?.message ||
        err?.message ||
        "Email atau password salah";

      return {
        success: false,
        message: error.value,
      };
    } finally {
      isLoading.value = false;
    }
  }

  // ======================================================
  // CURRENT USER
  // ======================================================

  async function fetchCurrentUser() {
    const savedToken = getSavedToken();

    if (!savedToken) {
      return null;
    }

    try {
      const response = await $fetch(
        "/auth/me",
        {
          baseURL: getApiBase(),
          headers: {
            Authorization:
              `Bearer ${savedToken}`,
          },
        },
      );

      user.value =
        response?.data || null;

      if (
        import.meta.client &&
        user.value
      ) {
        localStorage.setItem(
          "user",
          JSON.stringify(user.value),
        );
      }

      return user.value;
    } catch (err) {
      console.error(
        "[AUTH STORE] FETCH CURRENT USER ERROR:",
        err,
      );

      if (err?.status === 401 || err?.statusCode === 401) {
        logout();
      }

      return null;
    }
  }

  // ======================================================
  // ONBOARDING
  // ======================================================

  async function completeOnboarding(payload) {
    isLoading.value = true;
    error.value = "";

    try {
      const savedToken =
        getSavedToken();

      if (!savedToken) {
        throw new Error(
          "Token login tidak ditemukan",
        );
      }

      const response = await $fetch(
        "/onboarding",
        {
          baseURL: getApiBase(),
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${savedToken}`,
          },
          body: payload,
        },
      );

      user.value =
        response?.data || null;

      if (
        import.meta.client &&
        user.value
      ) {
        localStorage.setItem(
          "user",
          JSON.stringify(user.value),
        );
      }

      return {
        success: true,
        data: response?.data,
      };
    } catch (err) {
      console.error(
        "[AUTH STORE] ONBOARDING ERROR:",
        err,
      );

      error.value =
        err?.data?.message ||
        err?.message ||
        "Gagal menyimpan profil";

      return {
        success: false,
        message: error.value,
      };
    } finally {
      isLoading.value = false;
    }
  }

  // ======================================================
  // RESET PASSWORD
  // ======================================================

  async function resetPassword(
    password_lama,
    password_baru,
    konfirmasi_password,
  ) {
    isLoading.value = true;
    error.value = "";

    try {
      const savedToken =
        getSavedToken();

      if (!savedToken) {
        throw new Error(
          "Token login tidak ditemukan",
        );
      }

      const response = await $fetch(
        "/auth/reset-password",
        {
          baseURL: getApiBase(),
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${savedToken}`,
          },
          body: {
            password_lama,
            password_baru,
            konfirmasi_password,
          },
        },
      );

      return {
        success: true,
        data: response,
      };
    } catch (err) {
      console.error(
        "[AUTH STORE] RESET PASSWORD ERROR:",
        err,
      );

      error.value =
        err?.data?.message ||
        err?.message ||
        "Gagal mengubah password";

      return {
        success: false,
        message: error.value,
      };
    } finally {
      isLoading.value = false;
    }
  }

  // ======================================================
  // INITIALIZE AUTH
  // ======================================================

  function initializeAuth() {
    if (!import.meta.client) {
      return;
    }
    user.value = null;

    const savedToken =
      localStorage.getItem("token");

    const savedUser =
      localStorage.getItem("user");

    token.value =
      savedToken || null;

    if (savedUser) {
      try {
        user.value =
          JSON.parse(savedUser);
      } catch (err) {
        console.error(
          "[AUTH STORE] INVALID SAVED USER:",
          err,
        );

        user.value = null;

        localStorage.removeItem(
          "user",
        );
      }
    }
  }

  // ======================================================
  // LOGOUT
  // ======================================================

  function logout() {
    user.value = null;
    token.value = null;
    error.value = "";

    if (!import.meta.client) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(
      "justLoggedIn",
    );
  }

  return {
    user,
    token,
    isLoading,
    error,
    isActivated,

    register,
    login,
    fetchCurrentUser,
    completeOnboarding,
    resetPassword,

    initializeAuth,
    logout,
  };
});
