<script setup lang="ts">
import notEmpty from '~/assets/notEmpty.svg'
import empty from '~/assets/empty.svg'
import MapPopup from './MapPopup.vue'
import instance from '~/axiosInstance'
import { useRoute } from '#app'
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue'
import EditSeatDialog from '~/components/EditSeatDialog.vue'
import mapTile from '~/assets/mapTile.png'

function getFirstQueryParam(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined
    if (Array.isArray(value[0])) {
      return getFirstQueryParam(value[0])
    }
    return typeof value[0] === 'string' ? value[0] : undefined
  }
  return typeof value === 'string' ? value : undefined
}

const route = useRoute()
const rawStart = route.query.start as unknown
const startTime = getFirstQueryParam(rawStart)
const props = defineProps({
  editing: {
    type: Boolean,
    default: false,
    required: false,
  },
})

const toast = useToast()

const mapRef = ref(null)
const markerRef = ref(null)
const baseIconSize = 30
const baseFontSize = 10
const iconSize = ref<[number, number]>([baseIconSize, baseIconSize])
const fontSize = ref(baseFontSize)

function onMapReady(map: any) {
  setTimeout(() => {
    updateIconSize(map.getZoom())
    updateFontSize(map.getZoom())
  }, 100)
  map.on('zoomend', () => {
    updateIconSize(map.getZoom())
    updateFontSize(map.getZoom())
  })
}

const emit = defineEmits<{
  (e: 'confirm', endDate: Date): void
  (e: 'update', data: any): void
}>()

function updateIconSize(zoom: number) {
  const baseZoom = 10
  const scale = Math.pow(2, zoom - baseZoom)
  iconSize.value = [baseIconSize * scale, baseIconSize * scale]
}

function updateFontSize(zoom: number) {
  const baseZoom = 10
  const scale = Math.pow(2, zoom - baseZoom)
  fontSize.value = baseFontSize * scale
}

const objects = ref()

onMounted(async () => {
  if (props.editing) {
    const res = await instance.get('/seat', {
      params: {
        start: new Date(),
        end: new Date(),
      },
    })
    objects.value = res.data
    return
  }
  if (!startTime) {
    console.error('Параметр start отсутствует')
    return
  }

  const startDate = new Date(startTime)
  startDate.setMinutes(startDate.getMinutes() + 1)
  const converted = startDate.toISOString()

  const res = await instance.get('/seat', {
    params: {
      start: startTime,
      end: converted,
    },
  })
  objects.value = res.data
})

const isDialogOpened = ref(false)
const isEditingOpened = ref(false)
const itemID = ref()
const selectedItem = ref()
const newItem = ref()
const openDialog = (itemData: any) => {
  if (props.editing) {
    isEditingOpened.value = true
    selectedItem.value = itemData
    return
  }
  isDialogOpened.value = true
  itemID.value = itemData.id
}

const displayErrorToast = (msg: string) => {
  toast.add({
    severity: 'error',
    summary: 'Ошибка бронирования',
    detail: msg,
    life: 2500,
  })
}

const handleSeatBook = async (endDate: any) => {
  try {
    const res = await instance.post('/reservations', {
      user_id: localStorage.getItem('user_id'),
      seat_id: itemID.value,
      start: startTime,
      end: endDate,
    })
    navigateTo('/pass')
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(errorMessage)
    displayErrorToast(err.response.data?.detail)
  }
}

function onMarkerDragEnd(event: any, item: any) {
  const newCoords = event.target.getLatLng()
  item.x = newCoords.lat
  item.y = newCoords.lng
}

const createSeat = () => {
  const data = {
    name: '',
    type: 'seat',
    x: 47.44666502261753,
    y: -1.3018798828125002,
    has_computer: false,
    has_water: false,
    has_kitchen: false,
    has_smart_desk: false,
    is_quite: false,
    is_talk_room: false,
  }
  instance.post('/seat', data).then((seat) => {
    objects.value.push(seat.data)
    selectedItem.value = seat.data
    isEditingOpened.value = true
  })
}

const deleteSeat = (seat: any) => {
  instance.delete(`/seat/${seat.id}`).then(() => {
    const index = objects.value.indexOf(seat)
    objects.value.splice(index, 1)
  })
}

const goToMap = () => {
  location.href = 'https://yandex.ru/maps/-/CHBmMU33'
}
</script>

<template>
  <Toast />
  <EndTimeDialog
    v-model:visible="isDialogOpened"
    :start-date="startTime as string"
    @confirm="(endDate) => handleSeatBook(endDate)"
  />
  <EditSeatDialog v-model:visible="isEditingOpened" :item="selectedItem" />
  <div v-if="editing" class="absolute bottom-0 left-2 flex gap-4">
    <Button class="bottom-4 z-[999] !mx-auto" @click="$emit('update', objects)">Сохранить</Button>
    <Button class="bottom-4 z-[999] !mx-auto" severity="success" @click="createSeat"
      >Создать
    </Button>
  </div>
  <div class="absolute bottom-2 right-2 z-[999]">
    <Button icon="pi pi-map-marker" @click="goToMap"></Button>
  </div>

  <div class="relative h-[calc(100vh-58px)] w-full">
    <LMap
      ref="mapRef"
      class="z-0 h-full w-full"
      :zoom="9"
      :min-zoom="8"
      :max-zoom="11"
      :center="[47.5, -1.25]"
      :use-global-leaflet="false"
      :attributionControl="false"
      @ready="onMapReady"
    >
      <LImageOverlay
        :url="mapTile"
        :bounds="[
          [47, -2],
          [48, -0.5],
        ]"
        attribution=""
      />
      <LMarker
        ref="markerRef"
        v-for="item in objects"
        :lat-lng="[item.x, item.y]"
        :key="item.id"
        :draggable="editing"
        @dragend="onMarkerDragEnd($event, item)"
      >
        <LIcon
          :icon-size="iconSize"
          :icon-url="item.is_available ? empty : notEmpty"
          :icon-anchor="[iconSize[0] / 2, iconSize[1] / 2]"
        />
        <MapPopup
          @open-dialog="openDialog(item)"
          @delete-seat="deleteSeat(item)"
          :item="item"
          :editing="editing"
        />
      </LMarker>
    </LMap>
  </div>
</template>

<style>
.leaflet-control-attribution {
  display: none !important;
}
</style>
