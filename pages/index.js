import { defineComponent, h } from "vue";
import { navigateTo } from "#app";

export default defineComponent({
  async setup() {
    await navigateTo("/dashboard", { redirectCode: 302 });
    return () => h("div");
  },
});
