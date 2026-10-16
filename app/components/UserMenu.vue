
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()
const { user, clear } = useUserSession()

const colors = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose'
] as const

const neutrals = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'taupe',
  'mauve',
  'mist',
  'olive'
] as const

const displayName = computed(() =>
  user.value?.name ||
  user.value?.username ||
  'Account'
)

const items = computed<DropdownMenuItem[][]>(() => [
  // Account information
  [
    {
      type: 'label',
      label: displayName.value,
      avatar: {
        src: user.value?.avatar || undefined,
        alt: displayName.value
      }
    }
  ],

  // Personalization
  [
    {
      label: 'Personalize',
      icon: 'i-lucide-palette',
      children: [
        {
          label: 'Primary color',
          slot: 'chip',
          chip: appConfig.ui.colors.primary,
          content: {
            align: 'center',
            collisionPadding: 16
          },
          children: colors.map(color => ({
            label: color.charAt(0).toUpperCase() + color.slice(1),
            chip: color,
            slot: 'chip',
            type: 'checkbox' as const,
            checked: appConfig.ui.colors.primary === color,
            onSelect(e: Event) {
              e.preventDefault()
              appConfig.ui.colors.primary = color
            }
          }))
        },
        {
          label: 'Neutral color',
          slot: 'chip',
          chip:
            appConfig.ui.colors.neutral === 'neutral'
              ? 'old-neutral'
              : appConfig.ui.colors.neutral,
          content: {
            align: 'end',
            collisionPadding: 16
          },
          children: neutrals.map(color => ({
            label: color.charAt(0).toUpperCase() + color.slice(1),
            chip: color === 'neutral' ? 'old-neutral' : color,
            slot: 'chip',
            type: 'checkbox' as const,
            checked: appConfig.ui.colors.neutral === color,
            onSelect(e: Event) {
              e.preventDefault()
              appConfig.ui.colors.neutral = color
            }
          }))
        }
      ]
    },

    // Appearance
    {
      label: 'Appearance',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Light',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.preference === 'light',
          onSelect(e: Event) {
            e.preventDefault()
            colorMode.preference = 'light'
          }
        },
        {
          label: 'Dark',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.preference === 'dark',
          onSelect(e: Event) {
            e.preventDefault()
            colorMode.preference = 'dark'
          }
        },
        {
          label: 'System',
          icon: 'i-lucide-monitor',
          type: 'checkbox',
          checked: colorMode.preference === 'system',
          onSelect(e: Event) {
            e.preventDefault()
            colorMode.preference = 'system'
          }
        }
      ]
    }
  ],

  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      color: 'error',
      async onSelect() {
        await clear()
        await navigateTo('/')
      }
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{
      align: 'end',
      collisionPadding: 12
    }"
    :ui="{
      content: collapsed ? 'w-56' : 'w-64'
    }"
  >
    <UButton
      :label="collapsed ? undefined : displayName"
      :trailing-icon="
        collapsed
          ? undefined
          : 'i-lucide-chevrons-up-down'
      "
      :avatar="{
        src: user?.avatar || undefined,
        alt: displayName
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="rounded-xl  data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
        leadingAvatarSize: 'lg'

      }"
    />

    <template #chip-leading="{ item }">
      <div
        class="inline-flex size-5 shrink-0 items-center justify-center"
      >
        <span
          class="size-2 rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark)"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
