<script setup lang="ts">
import { yupResolver } from '@primevue/forms/resolvers/yup'
import { useToast } from '#imports'
import instance from '~/axiosInstance'
import { type TicketCreateModel, ticketCreateSchema } from '~/types/ticketModel'

definePageMeta({
  requireAuth: true,
})

const resolver = yupResolver(ticketCreateSchema)
const toast = useToast()
const selectedTheme = ref()
const themes = ref([
  { name: 'Неисправность', code: 'failure' },
  { name: 'Пожелание', code: 'wish' },
  { name: 'Другое', code: 'other' },
])

const displayErrorToast = (msg: string) => {
  toast.add({
    severity: 'error',
    summary: 'Ошибка регистрации',
    detail: msg,
    life: 2500,
  })
}

const onSubmit = (data: { valid: Boolean; values: TicketCreateModel }) => {
  if (!data.valid) {
    displayErrorToast('Проверьте правильность введенных данных')
    return
  }

  instance
    .post('/ticket', {
      message: data.values.message,
      theme: data.values.theme.code,
    })
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Тикет отправлен',
        detail: 'Ваша сообщение отправлено. Ожидайте',
        life: 2500,
      })
    })
}
</script>

<template>
  <Toast></Toast>
  <main class="m-4 flex items-center justify-center gap-2">
    <Form
      @submit="onSubmit"
      v-slot="form"
      :resolver="resolver"
      :validateOnValueUpdate="false"
      :validateOnBlur="true"
      class="animate-fadein mt-4 rounded-xl p-12 text-center backdrop-blur-md lg:w-[30rem]"
    >
      <div class="mb-12 text-2xl font-medium">Опишите Вашу проблему</div>
      <div class="mb-6">
        <Select
          v-model="selectedTheme"
          :options="themes"
          optionLabel="name"
          name="theme"
          placeholder="Тема обращения"
          class="!w-full !appearance-none !rounded-md !text-left"
        />
        <Message
          v-if="form.theme?.invalid"
          size="small"
          severity="error"
          variant="simple"
          class="ml-4"
        >
          {{ form.theme.error.message }}
        </Message>
      </div>
      <div class="mb-6">
        <Textarea
          rows="5"
          cols="30"
          name="message"
          class="!block !w-full !appearance-none !rounded-md"
          placeholder="Описание проблемы"
        />
        <Message
          v-if="form.message?.invalid"
          size="small"
          severity="error"
          variant="simple"
          class="ml-4"
        >
          {{ form.message.error.message }}
        </Message>
      </div>
      <Button type="submit" class="w-full"> Отправить </Button>
    </Form>
  </main>
</template>
<style scoped></style>
