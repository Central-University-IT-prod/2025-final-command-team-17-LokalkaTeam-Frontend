<script setup lang="ts">
const props = defineProps<{
  item: {
    name: string
    has_water: boolean
    has_kitchen: boolean
    has_computer: boolean
    is_available: boolean
  }
  editing: boolean
}>()

const emit = defineEmits<{
  (event: 'openDialog'): void
  (event: 'deleteSeat'): void
}>()
const availbale = props.item?.is_available
</script>

<template>
  <LPopup>
    <Panel :header="item.name">
      <div class="flex h-full w-[25vh] flex-col gap-4">
        <Message v-if="availbale && !editing" severity="success">Свободно</Message>
        <Message v-else-if="!availbale && !editing" severity="error">Занят</Message>
        <span v-if="item.has_water" class="text">
          Есть вода рядом:
          <i class="pi pi-check" style="font-size: 1rem"></i>
        </span>
        <span v-if="item.has_kitchen" class="text">
          Есть кухня рядом:
          <i class="pi pi-check" style="font-size: 1rem"></i>
        </span>
        <span v-if="item.has_computer" class="text">
          Есть компьютер:
          <i class="pi pi-check" style="font-size: 1rem"></i>
        </span>
        <span v-if="item.has_smart_desk" class="text">
          Есть умная доска:
          <i
            class="pi pi-check"
            style="font-size: 1rem"
          ></i>
        </span>
        <span v-if="item.is_quite" class="text">
          Место тихое:
          <i class="pi pi-check" style="font-size: 1rem"></i>
        </span>
        <span v-if="item.is_talk_room" class="text">
          Переговорная:
          <i class="pi pi-check" style="font-size: 1rem"></i>
        </span>
        <Button v-if="availbale && !editing" class="h-full w-full" @click="$emit('openDialog')"
          >Забронировать</Button
        >
        <Button v-else-if="!availbale && !editing" class="h-full w-full" disabled>Занято</Button>
        <div v-else-if="editing" class="flex gap-4">
          <Button @click="$emit('openDialog')" class="h-full w-full">Ред.</Button>
          <Button @click="$emit('deleteSeat')" class="h-full w-full">Удалить</Button>
        </div>
      </div>
    </Panel>
  </LPopup>
</template>

<style>
.leaflet-popup-content-wrapper {
  background-color: var(--p-panel-background);
}
</style>
