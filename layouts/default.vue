<template>
  <header>
    <Menubar :model="items">
      <template #item="{ item, props, hasSubmenu, root }">
        <a v-ripple class="flex items-center" v-bind="props.action">
          <span>{{ item.label }}</span>
          <Badge
            v-if="item.badge"
            :class="{ 'ml-auto': !root, 'ml-2': root }"
            :value="item.badge"
          />
          <span
            v-if="item.shortcut"
            class="border-surface bg-emphasis text-muted-color ml-auto rounded border p-1 text-xs"
            >{{ item.shortcut }}</span
          >
          <i
            v-if="hasSubmenu"
            :class="[
              'pi pi-angle-down ml-auto',
              { 'pi-angle-down': root, 'pi-angle-right': !root },
            ]"
          ></i>
        </a>
      </template>
      <template #end>
        <NuxtLink class="flex items-center gap-2" to="/profile">
          <Avatar :image="API + '/avatar'" shape="circle" />
        </NuxtLink>
      </template>
    </Menubar>
  </header>
  <slot />
</template>

<script setup lang="ts">
import { API } from '~/constants/Api'

const items = ref([
  {
    label: 'Главная',
    command: () => {
      return navigateTo('/')
    },
  },
  {
    label: 'QR',
    command: () => {
      return navigateTo('/pass')
    },
  },
  {
    label: 'История',
    command: () => {
      return navigateTo('/signups')
    },
  },
  {
    label: 'У меня проблема',
    command: () => {
      return navigateTo('/ticket')
    },
  },
])

onMounted(() => {
  const data = JSON.parse(localStorage.getItem('user')!)

  if (data.user.role === 'admin') {
    items.value.push({
      label: 'Админ',
      items: [
        {
          label: 'Тикеты',
          command: () => {
            return navigateTo('/admin/tickets')
          },
        },
        {
          label: 'Сканировать QR',
          command: () => {
            return navigateTo('/admin/scanner')
          },
        },
        {
          label: 'Все записи',
          command: () => {
            return navigateTo('/admin/signups')
          },
        },
        {
          label: 'Пользователи',
          command: () => {
            return navigateTo('/admin/users')
          },
        },
        {
          label: 'Настройка коворка',
          command: () => {
            return navigateTo('/admin/admin_map')
          },
        },
      ],
    })
  }
})
</script>
