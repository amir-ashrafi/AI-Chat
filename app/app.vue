
<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() =>
  colorMode.value === 'dark' ? '#1b1718' : 'white'
)

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/logo.svg' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'AI Chatbot | Amir Ashrafi'
const description =
  'A modern AI chatbot built with Nuxt and Vue, designed to deliver a seamless conversational experience with a clean UI and scalable architecture.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/chat-light.png',
  twitterCard: 'summary_large_image'
})

const isReady = ref(false)

onMounted(async () => {
  const startTime = Date.now()

  const logo = new Image()
  logo.src = '/logo.svg'

  try {
    await logo.decode()
  } catch {
    
  }

  const elapsed = Date.now() - startTime
  const remaining = Math.max(0, 1500 - elapsed)

  await new Promise(resolve => setTimeout(resolve, remaining))

  isReady.value = true
})
</script>

<template>
  <UApp
    :toaster="{ position: 'top-right' }"
    :tooltip="{ delayDuration: 200 }"
  >
    <Transition name="loader-fade">
      <div
        v-if="!isReady"
        class="site-loader"
        role="status"
        aria-label="Loading website"
      >
        <div class="loader-content">
          <img
            src="/logo.svg"
            alt=""
            class="loader-logo"
          />

          <div class="loader-track">
            <span class="loader-progress" />
          </div>
        </div>
      </div>
    </Transition>

    <div :class="{ 'site-content-hidden': !isReady }">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>

<style>
.site-loader {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: grid;
  place-items: center;
  background: #0b1020;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  width: 140px;
}

.loader-logo {
  display: block;
  width: 44px;
  height: 44px;
  object-fit: contain;
  animation: logo-pulse 1.6s ease-in-out infinite;
}

.loader-track {
  width: 100%;
  height: 2px;
  overflow: hidden;
  border-radius: 10px;
  background: rgb(255 255 255 / 12%);
}

.loader-progress {
  display: block;
  width: 40%;
  height: 100%;
  border-radius: inherit;
  background: #fff;
  animation: loader-slide 1.2s ease-in-out infinite;
}

.site-content-hidden {
  visibility: hidden;
}

.loader-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loader-fade-leave-to {
  opacity: 0;
}

@keyframes logo-pulse {
  0%, 100% {
    opacity: 0.65;
  }

  50% {
    opacity: 1;
  }
}

@keyframes loader-slide {
  from {
    transform: translateX(-110%);
  }

  to {
    transform: translateX(350%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader-logo,
  .loader-progress {
    animation: none;
  }
}
</style>
