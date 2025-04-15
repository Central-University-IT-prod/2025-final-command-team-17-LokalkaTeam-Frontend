<script setup lang="ts">
interface Props {
  item: any
}

const props = defineProps<Props>()

const modelVisible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{
  (e: 'confirm', endDate: Date): void
}>()
</script>

<template>
  <Dialog v-model:visible="modelVisible" modal header="Настроить место" :style="{ width: '25rem' }">
    <div class="flex flex-col gap-3">
      <div class="inline-flex items-center gap-4">
        <InputText type="text" v-model="item.name" />
      </div>
      <div class="inline-flex items-center gap-4">
        <span>Есть компьютер: </span>
        <ToggleSwitch v-model="item.has_computer"></ToggleSwitch>
      </div>
      <div class="inline-flex items-center gap-4">
        <span>Есть кухня рядом: </span>
        <ToggleSwitch v-model="item.has_kitchen"></ToggleSwitch>
      </div>
      <div class="inline-flex items-center gap-4">
        <span>Есть вода рядом: </span>
        <ToggleSwitch v-model="item.has_water"></ToggleSwitch>
      </div>
      <div class="inline-flex items-center gap-4">
        <span>Есть умная доска: </span>
        <ToggleSwitch v-model="item.has_smart_desk"></ToggleSwitch>
      </div>
      <div class="inline-flex items-center gap-4">
        <span>Место тихое: </span>
        <ToggleSwitch v-model="item.is_quite"></ToggleSwitch>
      </div>
      <div class="inline-flex items-center gap-4">
        <span>Переговорная комната: </span>
        <ToggleSwitch v-model="item.is_talk_room"></ToggleSwitch>
      </div>
      <Button class="w-full" @click="modelVisible = false">Сохранить</Button>
    </div>
  </Dialog>
</template>
