// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 3
  },
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/tailwindcss',
    "@pinia/nuxt",
  ],

  app: {
    head: {
      title: 'MatrIQ - Dashboard Belajar UTBK',
      htmlAttrs: {
        lang: 'id'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'MatrIQ - Platform Belajar dan Dashboard Simulasi UTBK Modern, Cerdas, dan Menyenangkan' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
      supportWhatsapp: process.env.NUXT_PUBLIC_SUPPORT_WHATSAPP || '',
      supportInstagram: process.env.NUXT_PUBLIC_SUPPORT_INSTAGRAM || ''
    }
  }
})
