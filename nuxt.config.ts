import MainTheme from './theme/mainTheme'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL,
    },
  },
  modules: ['@primevue/nuxt-module', '@nuxtjs/tailwindcss', '@nuxtjs/leaflet'],
  css: [
    'primeicons/primeicons.css', // Add this line
    // Optionally include the PrimeVue base styles if needed:
    // 'primevue/resources/primevue.min.css'
  ],
  primevue: {
    options: {
      theme: {
        preset: MainTheme,
      },
    },
  },
})
