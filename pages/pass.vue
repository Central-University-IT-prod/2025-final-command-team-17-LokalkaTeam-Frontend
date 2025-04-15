<template>
    <div v-if="reservationData" class="h-full w-screen flex flex-col items-center justify-center p-6 gap-4">
      <h1 class="text-xl lg:text-3xl font-bold">Место: {{ reservationData.seat_name }}</h1>
  
      <div class="flex items-center space-x-2">
        <h3 class="text-lg lg:text-xl font-medium">С: {{ formattedStart }}</h3>
        <Divider layout="vertical" class="!h-10" />
        <h3 class="text-lg lg:text-xl font-medium">До: {{ formattedEnd }}</h3>
      </div>
  
      <div ref="qrCodeRef" class="w-full max-w-md h-auto aspect-square flex justify-center"></div>
  
      <!-- Кнопка отмены брони -->
      <Button label="Отмена брони" severity="danger" class="w-full max-w-xs mt-4" @click="confirmCancelReservation" />
    </div>
  
    <!-- Диалог подтверждения -->
    <ConfirmDialog>
      <template #footer="{ accept, reject }">
        <Button label="Нет" icon="pi pi-times" class="p-button-text" @click="reject" />
        <Button label="Да" icon="pi pi-check" class="p-button-danger" @click="accept" />
      </template>
    </ConfirmDialog>

    <NothingHere v-if="!reservationData" />
  </template>
  
  <script setup>
  import { useConfirm } from 'primevue/useconfirm';
  import QRCodeStyling from 'qr-code-styling';
  import lottieQR from '~/assets/lottieQR.png';
  import instance from '~/axiosInstance';
  import { formatDate } from '#imports';
  
  const qrCodeRef = ref(null)
  const reservationData = ref(null)
  let qrCode = null
  const confirm = useConfirm()

  const formattedStart = computed(() => formatDate(reservationData.value?.start))
  const formattedEnd = computed(() => formatDate(reservationData.value?.end))
  
  onMounted(async () => {
    try {
      const { data } = await instance.get('/reservations/active')
      reservationData.value = data
  
      await nextTick()
  
      qrCode = new QRCodeStyling({
        type: 'svg',
        width: 300,
        height: 300,
        data: data.id || 'default',
        image: lottieQR,
        margin: 0,
        qrOptions: { errorCorrectionLevel: 'H' },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4 },
        cornersSquareOptions: { type: 'square', color: '#000000' },
        dotsOptions: { type: 'square', color: '#000000' },
        backgroundOptions: { color: '#ffffff' },
      })
  
      if (qrCodeRef.value) {
        qrCode.append(qrCodeRef.value)
        updateQRCodeSize()
        observeResize()
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err))
    }
  })
  
  const updateQRCodeSize = () => {
    if (qrCodeRef.value) {
      const size = Math.min(qrCodeRef.value.offsetWidth, 400)
      qrCode.update({ width: size, height: size })
    }
  }
  
  const observeResize = () => {
    if (!qrCodeRef.value) return
    new ResizeObserver(updateQRCodeSize).observe(qrCodeRef.value)
  }
  
  const cancelReservation = async () => {
    try {
      await instance.patch(`/reservations/${reservationData.value.id}`, {
        start: reservationData.value.start,
        end: reservationData.value.end,
        status: 'closed',
      });
      navigateTo('/signups')
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err))
    }
  }
  

  const confirmCancelReservation = () => {
    confirm.require({
      message: 'Вы уверены, что хотите отменить бронь?',
      header: 'Подтверждение отмены',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Нет',
      acceptLabel: 'Да',
      acceptClass: 'p-button-danger',
      accept: cancelReservation,
    })
  }
  </script>
  
  <style scoped>
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
  </style>
  