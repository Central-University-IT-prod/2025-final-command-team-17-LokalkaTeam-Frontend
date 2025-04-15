<template>
  <Toast />
  <div v-if="isMounted" class="flex h-full items-center justify-center p-4">
    <div class="card flex w-full max-w-md flex-col gap-4 rounded-lg p-8 shadow-xl">
      <h1 class="mb-6 text-center text-3xl font-bold">Выберите дату начала</h1>
      <Calendar
        v-model="selectedDate"
        showTime
        hourFormat="24"
        :stepMinute="15"
        :minDate="minDate"
        @update:modelValue="handleDateChange"
        showIcon
      />
      <Button
        label="Подтвердить"
        class="p-button-rounded p-button-outlined w-full"
        @click="confirmDate"
      />
      <!-- Отображение выбранной даты -->
      <div v-if="selectedDate" class="mt-4 text-center text-gray-600">
        Вы выбрали: <strong>{{ formattedDate }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()

const selectedDate = ref(null)
const minDate = computed(() => new Date())


const roundUpToNearestStep = (date, stepMinutes) => {
  const minutes = date.getMinutes()
  const remainder = minutes % stepMinutes
  if (remainder !== 0) {
    date.setMinutes(minutes + (stepMinutes - remainder))
    date.setSeconds(0)
    date.setMilliseconds(0)
  }
  return date
}

const isMounted = ref(false)


onMounted(() => {
  console.log('index mounted')
  selectedDate.value = new Date()
  isMounted.value = true
})


const handleDateChange = (newDate) => {
  if (newDate) {
    const selected = new Date(newDate)
    const current = new Date()


    if (selected.toDateString() === current.toDateString()) {

      if (selected < current) {
        const nextTime = roundUpToNearestStep(new Date(), 15)
        selected.setHours(nextTime.getHours(), nextTime.getMinutes(), 0, 0)
        selectedDate.value = selected
      }
    }
  }
}


const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(selectedDate.value)
})

const confirmDate = () => {
  if (selectedDate.value) {
    router.push({ path: '/map', query: { start: selectedDate.value.toISOString() } })
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Выберите дату!',
      life: 2000,
    })
  }
}
</script>
