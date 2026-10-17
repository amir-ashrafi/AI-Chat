// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode','@nuxt/ui', 'nuxt-auth-utils', 'nuxt-csurf', '@vueuse/nuxt/module', 'nuxt-charts','@nuxthub/core', '@nuxt/eslint',
  ],
  css: ['~/assets/css/main.css'],
  experimental: {
    viewTransition: true
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  hub: {
    db: {
      dialect: 'sqlite',
      driver: 'libsql',
      applyMigrationsDuringBuild: false
    },
    blob: true
  },

  vite: {
    optimizeDeps: {
      include: ['striptags']
    }
  },

  runtimeConfig: {
    ollamaBaseURL: 'http://127.0.0.1:11434',
    groqApiKey: ''
  },
  devtools: { enabled: true }
})
