<template>
  <div class="flex min-w-0 items-center justify-between pt-1 select-none">
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-lg font-bold text-slate-900 sm:text-2xl">Welcome Back!</span>
        <span class="text-2xl animate-bounce">✌️</span>
      </div>
      <h1 class="mt-1 truncate text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {{ name }}
      </h1>
      <p class="text-slate-500 text-sm font-medium mt-1">
        Langkah kecil hari ini, hasil besar nanti! 🚀
      </p>
    </div>

    <!-- Enthusiastic Waving Mascot -->
    <div class="relative w-36 h-28 hidden md:block group cursor-pointer">
      <img
        src="/mascot/16.svg"
        alt="MatrIQ mascot"
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-35 w-auto transform transition-transform group-hover:scale-110 duration-300 drop-shadow-md"
      />
      <img
        src="/mascot/15.svg"
        alt="waving hand"
        class="absolute right-0 xl:-right-10 top-3 h-28 w-auto animate-wiggle origin-bottom-right"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name?: string;
}>();
</script>
