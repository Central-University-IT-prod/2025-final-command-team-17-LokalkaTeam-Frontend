<script setup lang="ts">
import { ref, computed, watch, defineModel, defineProps, defineEmits } from 'vue'

interface Props {
  startDate: Date | string
}

const props = defineProps<Props>()

const modelVisible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  (e: 'confirm', endDate: Date): void
}>()

const selectedEndDate = ref<Date | null>(null)

const normalizedStartDate = computed(() => {
  return props.startDate instanceof Date
    ? new Date(props.startDate.getTime())
    : new Date(props.startDate)
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

const formattedEndDate = computed(() => {
  return selectedEndDate.value
    ? new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(selectedEndDate.value)
    : ''
})

const setHalfHour = () => {
  const baseDate = selectedEndDate.value
    ? new Date(selectedEndDate.value.getTime())
    : new Date(normalizedStartDate.value.getTime())

  baseDate.setUTCMinutes(baseDate.getUTCMinutes() + 30)

  selectedEndDate.value =
    baseDate > maxSelectableEndDate.value ? new Date(maxSelectableEndDate.value) : baseDate
}

const setOneHour = () => {
  const baseDate = selectedEndDate.value
    ? new Date(selectedEndDate.value.getTime())
    : new Date(normalizedStartDate.value.getTime())

  baseDate.setUTCHours(baseDate.getUTCHours() + 1)

  selectedEndDate.value =
    baseDate > maxSelectableEndDate.value ? new Date(maxSelectableEndDate.value) : baseDate
}

const setTwoHours = () => {
  const baseDate = selectedEndDate.value
    ? new Date(selectedEndDate.value.getTime())
    : new Date(normalizedStartDate.value.getTime())

  baseDate.setUTCHours(baseDate.getUTCHours() + 2)

  selectedEndDate.value =
    baseDate > maxSelectableEndDate.value ? new Date(maxSelectableEndDate.value) : baseDate
}

const confirmEndDate = () => {
  if (selectedEndDate.value && selectedEndDate.value > normalizedStartDate.value) {
    emit('confirm', selectedEndDate.value)
    modelVisible.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="modelVisible"
    modal
    header="Выберите дату окончания"
    :style="{ width: '25rem' }"
  >
    <div class="flex flex-col gap-3">
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
        <Button label="+30 мин" class="p-button-sm p-button-outlined" @click="setHalfHour" />
        <Button label="+1 час" class="p-button-sm p-button-outlined" @click="setOneHour" />
        <Button label="+2 часа" class="p-button-sm p-button-outlined" @click="setTwoHours" />
      </div>
      <Button class="w-full" :disabled="!selectedEndDate" @click="confirmEndDate">
        Подтвердить
      </Button>
      <div v-if="selectedEndDate" class="text-center text-gray-600">
        Вы выбрали: <strong>{{ formattedEndDate }}</strong>
      </div>
    </div>
  </Dialog>
</template>
