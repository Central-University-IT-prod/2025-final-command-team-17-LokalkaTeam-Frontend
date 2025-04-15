<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import instance from '~/axiosInstance'

const startDate = ref(new Date())
const modelVisible = defineModel<boolean>('visible', { default: false })
const maxAvailableDate = ref()

const emit = defineEmits<{
  (e: 'save', startDate: Date, endDate: Date): void
}>()

const selectedEndDate = ref<Date | null>(null)

const normalizedStartDate = computed(() => {
  return startDate.value ? new Date(startDate.value.getTime()) : new Date(startDate.value)
})

const minSelectableEndDate = computed(() => {
  return new Date(normalizedStartDate.value.getTime())
})

const maxSelectableEndDate = computed(() => {
  const maxDate = new Date(normalizedStartDate.value.getTime())
  maxDate.setUTCHours(maxDate.getUTCHours() + 24)
  return maxDate
})

watch(
  () => modelVisible.value,
  (newVal) => {
    if (!newVal) {
      selectedEndDate.value = null
    }
  }
)

watch(startDate, () => {
  instance
    .get('/reservations/maximum-available-time', {
      params: { start_time: startDate.value.toISOString() },
    })
    .then((response) => {
      if (response.data.maximum_available_time === -1) {
        maxAvailableDate.value = -1
        return
      }
      maxAvailableDate.value = new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(response.data.maximum_available_time))
    })
})

const isEndDateValid = () => {
  if (selectedEndDate.value && selectedEndDate.value <= normalizedStartDate.value) return false
  return maxAvailableDate.value === -1
}

const formattedEndDate = computed(() => {
  return selectedEndDate.value
    ? new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(selectedEndDate.value)
    : ''
})

const setHalfHour = (start: boolean = false) => {
  const newDate = start
    ? new Date(startDate.value.getTime())
    : selectedEndDate.value
      ? new Date(selectedEndDate.value.getTime())
      : new Date(normalizedStartDate.value.getTime())

  newDate.setMinutes(newDate.getMinutes() + 30)

  if (newDate > maxSelectableEndDate.value) {
    if (start) startDate.value = new Date(maxSelectableEndDate.value)
    else selectedEndDate.value = new Date(maxSelectableEndDate.value)
  } else {
    if (start) startDate.value = newDate
    else selectedEndDate.value = newDate
  }
}

const setOneHour = (start: boolean = false) => {
  const newDate = start
    ? new Date(startDate.value.getTime())
    : selectedEndDate.value
      ? new Date(selectedEndDate.value.getTime())
      : new Date(normalizedStartDate.value.getTime())

  newDate.setHours(newDate.getHours() + 1)

  if (newDate > maxSelectableEndDate.value) {
    if (start) startDate.value = new Date(maxSelectableEndDate.value)
    else selectedEndDate.value = new Date(maxSelectableEndDate.value)
  } else {
    if (start) startDate.value = newDate
    else selectedEndDate.value = newDate
  }
}

const setTwoHours = (start: boolean = false) => {
  const newDate = start
    ? new Date(startDate.value.getTime())
    : selectedEndDate.value
      ? new Date(selectedEndDate.value.getTime())
      : new Date(normalizedStartDate.value.getTime())

  newDate.setHours(newDate.getHours() + 2)

  if (newDate > maxSelectableEndDate.value) {
    if (start) startDate.value = new Date(maxSelectableEndDate.value)
    else selectedEndDate.value = new Date(maxSelectableEndDate.value)
  } else {
    if (start) startDate.value = newDate
    else selectedEndDate.value = newDate
  }
}

const confirmEndDate = () => {
  if (selectedEndDate.value && isEndDateValid()) {
    emit('save', startDate.value, selectedEndDate.value)
    modelVisible.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="modelVisible"
    modal
    header="Перенос бронирования"
    :style="{ width: '25rem' }"
  >
    <div class="flex flex-col gap-3">
      <DatePicker
        v-model="startDate"
        :defaultValue="normalizedStartDate"
        showTime
        hourFormat="24"
        :stepMinute="15"
        placeholder="Выберите дату окончания"
        class="w-full"
      />
      <div class="flex justify-center gap-2">
        <Button label="+30 мин" class="p-button-sm p-button-outlined" @click="setHalfHour(true)" />
        <Button label="+1 час" class="p-button-sm p-button-outlined" @click="setOneHour(true)" />
        <Button label="+2 часа" class="p-button-sm p-button-outlined" @click="setTwoHours(true)" />
      </div>
      <DatePicker
        v-model="selectedEndDate"
        :defaultValue="normalizedStartDate"
        showTime
        hourFormat="24"
        :stepMinute="15"
        placeholder="Выберите дату окончания"
        class="w-full"
        :minDate="minSelectableEndDate"
        :maxDate="maxSelectableEndDate"
      />
      <div class="flex justify-center gap-2">
        <Button label="+30 мин" class="p-button-sm p-button-outlined" @click="setHalfHour()" />
        <Button label="+1 час" class="p-button-sm p-button-outlined" @click="setOneHour()" />
        <Button label="+2 часа" class="p-button-sm p-button-outlined" @click="setTwoHours()" />
      </div>
      <Button
        class="w-full"
        :disabled="!selectedEndDate || !isEndDateValid()"
        @click="confirmEndDate"
      >
        Перенести
      </Button>
      <div
        v-if="startDate && maxAvailableDate !== -1 && maxAvailableDate"
        class="text-center text-gray-600"
      >
        Пересекается с бронью на: <strong>{{ maxAvailableDate }}</strong>
      </div>
      <div v-if="selectedEndDate" class="text-center text-gray-600">
        Вы выбрали: <strong>{{ formattedEndDate }}</strong>
      </div>
    </div>
  </Dialog>
</template>
