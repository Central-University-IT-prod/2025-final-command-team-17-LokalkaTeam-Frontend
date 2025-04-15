<template>
  <div class="card">
    <DataView :value="tickets" data-key="id" v-if="tickets && tickets.length >= 1">
      <template #list="slotProps">
        <div class="flex flex-col">
          <div v-for="(item, index) in slotProps.items" :key="index">
            <div
              class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center"
              :class="{ 'border-surface-200 dark:border-surface-700 border-t': index !== 0 }"
            >
              <div class="relative md:w-40">
                <img
                  class="mx-auto block w-full rounded xl:block"
                  src="/assets/testIcon.png"
                  :alt="item.name"
                />
                <div class="absolute rounded-md bg-black/70" style="left: 4px; top: 4px">
                  <Tag :value="item.status" :severity="getSeverity(item)"></Tag>
                </div>
              </div>
              <div class="flex flex-1 flex-col justify-between gap-6 md:flex-row md:items-center">
                <div class="flex flex-row items-start justify-between gap-2 md:flex-col">
                  <div>
                    <span class="text-surface-500 dark:text-surface-400 text-sm font-medium">{{
                      getTheme(item)
                    }}</span>
                    <div class="mt-2 text-lg font-medium">{{ item.message }}</div>
                  </div>
                  <div class="bg-surface-100 p-1" style="border-radius: 30px">
                    <div class="bg-surface-0 flex items-center justify-center gap-2">
                      <i class="pi pi-map-marker text-yellow-500"></i>
                      <span class="text-surface-900 text-base font-medium">{{
                        item.seat_name
                      }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col gap-8 md:items-end">
                  <span class="text-xl font-semibold">
                    Создан в:
                    {{ new Date(item.made_on).getHours().toString().padStart(2, '0') }}:{{
                      new Date(item.made_on).getMinutes().toString().padStart(2, '0')
                    }}
                    <i class="pi pi-clock text-blue-500"></i>
                  </span>
                  <div class="flex flex-row-reverse gap-2 md:flex-row">
                    <Button
                      icon="pi pi-verified"
                      label="Закрыть тикет"
                      @click="closeTicket(item)"
                      v-if="item.status !== 'ЗАКРЫТЫЙ'"
                      class="flex-auto whitespace-nowrap md:flex-initial"
                    ></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>
    <NothingHere v-else />
  </div>
</template>

<script setup lang="ts">
import instance from '~/axiosInstance.js'
import type { TicketModel } from '~/types/ticketModel.js'

definePageMeta({
  middleware: 'admin',
  requireAuth: false,
})
const tickets = ref()
onMounted(async () => {
  tickets.value = (await instance.get('/admin/tickets')).data
})

const closeTicket = async (ticket: TicketModel) => {
  await instance.patch(`/admin/ticket/${ticket.id}/status`, { status: 'closed' })
  ticket.status = 'closed'
}

const getTheme = (ticket: TicketModel) => {
  switch (ticket.theme) {
    case 'wish':
      return 'Пожелание'
    case 'failure':
      return 'Неисправность'
    case 'other':
      return 'Другое'
  }
}

const getSeverity = (ticket: TicketModel) => {
  switch (ticket.status) {
    case 'active':
      ticket.status = 'АКТИВНЫЙ'
      return null
    case 'АКТИВНЫЙ':
      return 'danger'

    case 'closed':
      ticket.status = 'ЗАКРЫТЫЙ'
      return null
    case 'ЗАКРЫТЫЙ':
      return 'success'

    default:
      return 'info'
  }
}
</script>
