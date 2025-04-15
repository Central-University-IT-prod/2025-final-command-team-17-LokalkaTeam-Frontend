<template>
    <div class="min-h-screen flex items-center justify-center p-4">
      <div v-if="loading" class="flex items-center justify-center py-10">
        <ProgressSpinner class="w-12 h-12" />
      </div>
      <div v-else>
        <Card v-if="user && user.verified" class="w-full max-w-md shadow-lg">
          <template #title>
            <h2 class="text-2xl font-semibold text-center">Посещение подтверждено!</h2>
          </template>
          <template #content>
            <div class="p-4">
            <div v-if="error" class="text-center">
              <p>Произошла ошибка при загрузке данных.</p>
            </div>
            <div v-else class="space-y-4">
              <div>
                <span class="font-bold">Место: </span>{{ seat.name || 'Не указано' }}
              </div>
              <div>
                <span class="font-bold">С: </span>{{ formattedStart }}
              </div>
              <div>
                <span class="font-bold">До: </span>{{ formattedEnd }}
              </div>
            </div>
          </div>
          </template>
        </Card>
        <Button
          v-else
          label="Верифицировать (проверить паспорт)"
          @click="handleScanAndVerification"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  import Card from 'primevue/card'
  import ProgressSpinner from 'primevue/progressspinner'
  import Button from 'primevue/button'
  import { formatDate } from '#imports'
  import instance from '~/axiosInstance'
  
  const route = useRoute()
  const id = route.query.id

  definePageMeta({
  middleware: 'admin',
  requireAuth: false,
})
  
  const seat = ref(null)
  const user = ref(null)
  const start = ref(null)
  const end = ref(null)
  const loading = ref(true)
  const error = ref(false)
  
  const formattedStart = computed(() =>
    start.value ? formatDate(start.value) : ''
  )
  const formattedEnd = computed(() =>
    end.value ? formatDate(end.value) : ''
  )
  
  onMounted(async () => {
    if (!id) {
      error.value = true
      loading.value = false
      return
    }
    try {
      const reservationResponse = await instance.get(`/admin/reservation/${id}`)
      const reservationData = reservationResponse.data
  
      const seatResponse = await instance.get(`/seat/${reservationData.seat_id}`)
      const userResponse = await instance.get(`/user/${reservationData.user_id}`)
  
      seat.value = seatResponse.data
      user.value = userResponse.data

      if (userResponse.data.verified) {
        await instance.post(`/admin/check_qr/${id}`)
      }
  
      start.value = new Date(reservationData.start)
      end.value = new Date(reservationData.end)
    } catch (err) {
      error.value = true
      console.error(err)
    } finally {
      loading.value = false
    }
  })
  
  const handleScanAndVerification = async () => {
    try {
      await instance.post(`/admin/verify_user/${user.value.id}`)
      await instance.post(`/admin/check_qr/${id}`)
      user.value.verified = true      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error(errorMessage)
    }
  }
  </script>
  