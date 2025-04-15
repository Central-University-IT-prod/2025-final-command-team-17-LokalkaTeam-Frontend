<template>
  <MoveTimeDialog v-model:visible="isMovedOpen" @save="saveMove" />
  <div class="card">
    <DataView :value="signups" dataKey="id" v-if="signups && signups.length">
      <template #list="slotProps">
        <div class="flex flex-col">
          <div
            v-for="(item, index) in slotProps.items"
            :key="index"
            class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center"
            :class="{ 'border-surface-200 dark:border-surface-700 border-t': index !== 0 }"
          >
            <div class="relative md:w-40">
              <img
                class="mx-auto block w-full rounded xl:block"
                src="/assets/testIcon.png"
                :alt="item.seat_name"
              />
              <div class="absolute rounded-md bg-black/70" style="left: 4px; top: 4px">
                <Tag :value="getStatusInfo(item).label" :severity="getStatusInfo(item).severity" />
              </div>
            </div>
            <div class="flex flex-1 flex-col justify-between gap-6 md:flex-row md:items-center">
              <div class="flex flex-row items-start justify-between gap-2 md:flex-col">
                <div>
                  <div class="mt-2 text-lg font-medium">
                    Начало: {{ formattedTime(new Date(item.start)) }}
                  </div>
                  <div class="mt-2 text-lg font-medium">
                    Конец: {{ formattedTime(new Date(item.end)) }}
                  </div>
                </div>
                <div class="bg-surface-100 p-1" style="border-radius: 30px">
                  <div class="bg-surface-0 flex items-center justify-center gap-2">
                    <i class="pi pi-map-marker text-yellow-500"></i>
                    <span class="text-surface-900 text-base font-medium">{{ item.seat_name }}</span>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-8 md:items-end">
                <span class="text-xl font-semibold">
                  <span v-if="getStatusInfo(item).label === 'Ожидается'">Время брони: </span>
                  {{ getTimeDelta(new Date(item.end).getTime() - new Date(item.start).getTime()) }}
                  <i class="pi pi-clock text-blue-500"></i>
                </span>
                <div class="flex flex-row-reverse gap-2 md:flex-row">
                  <Button
                    icon="pi pi-times-circle"
                    label="Отменить бронь"
                    v-if="getStatusInfo(item).label === 'Ожидается'"
                    severity="danger"
                    class="flex-auto whitespace-nowrap md:flex-initial"
                    @click="deleteReservation(item)"
                  />
                  <Button
                    icon="pi pi-forward"
                    label="Перенести бронь"
                    v-if="getStatusInfo(item).label === 'Ожидается' || getStatusInfo(item).label === 'Активен'"
                    severity="warn"
                    class="flex-auto whitespace-nowrap md:flex-initial"
                    @click="moveReservation(item)"
                  />
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
import type { ReservationModel } from '~/types/reservationModel'
import instance from '~/axiosInstance'

definePageMeta({
  requireAuth: true,
})

const isMovedOpen = ref(false)
const signups = ref<ReservationModel[]>([])
const selectedItem = ref()

onMounted(async () => {
  try {
    const response = await instance.get<ReservationModel[]>('/reservations')
    signups.value = response.data
  } catch (error) {
    console.error(error)
  }
})

const saveMove = (start: Date, end: Date) => {
  instance.patch(`/reservations/${selectedItem.value.id}`, { start: start, end: end }).then(() => {
    location.reload()
  })
}

const moveReservation = (item: ReservationModel) => {
  isMovedOpen.value = true
  selectedItem.value = item
}

const getStatusInfo = (
  ticket: ReservationModel
): {
  label: string
  severity: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'
} => {
  switch (ticket.status) {
    case 'future':
      return { label: 'Ожидается', severity: 'info' }
    case 'active':
      return { label: 'Активен', severity: 'info' }
    case 'did_not_come':
      return { label: 'Неявка', severity: 'warn' }
    case 'closed':
      return { label: 'Завершен', severity: 'danger' }
    default:
      return { label: ticket.status, severity: 'secondary' }
  }
}

const deleteReservation = async (reservation: any) => {
  try {
    await instance.patch(`/reservations/${reservation.id}`, {
      start: reservation.start,
      end: reservation.end,
      status: 'closed',
    });
    const response = await instance.get<ReservationModel[]>('/reservations')
    signups.value = response.data
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(errorMessage)
  }
};

const getTimeDelta = (deltaMs: number): string => {
  if (deltaMs < 0) return 'Ошибка: некорректное время'
  const totalSeconds = Math.floor(deltaMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${hours}:${minutes.toString().padStart(2, '0')}`
}

const formattedTime = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}
</script>
