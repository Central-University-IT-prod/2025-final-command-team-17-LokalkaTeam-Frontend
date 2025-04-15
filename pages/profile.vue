<script setup lang="ts">
import { type UserModel, userSchema } from '~/types/userModel'
import { yupResolver } from '@primevue/forms/resolvers/yup'
import instance from '~/axiosInstance'
import { API } from '~/constants/Api'

const user = ref<UserModel>()
const isEditing = ref(false)
const resolver = yupResolver(userSchema)
const isLoading = ref(false)
const openTg = ref(false)
const tokenTg = ref()

onMounted(async () => {
  user.value = (await instance.get('/user/me')).data
  tokenTg.value = (await instance.get('/telegram/get_token')).data
})

const leave = () => {
  instance.post('/auth/logout', {}).then(() => {
    navigateTo('/login')
  })
}

const edit = async (data: { valid: Boolean; states: any }) => {
  if (!data.valid) {
    return
  }
  isLoading.value = true
  const newEmail = data.states.email.value
  const newName = data.states.first_name.value
  await instance.patch('/user', {
    email: newEmail,
    first_name: newName,
  })
  user.value!.email = newEmail
  user.value!.first_name = newName

  isEditing.value = false
  isLoading.value = false
}

const uploadAvatar = (event: any) => {
  let formData = new FormData()
  formData.append('file', event.files[0])
  instance
    .post('/avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(() => {
      const reader = new FileReader()
      reader.readAsDataURL(event.files[0])
      reader.onload = () => {
        let userImage = document.getElementsByClassName('user-avatar')
        Array.from(userImage).forEach((img) => {
          const src = img.src.split('?')
          img.src = `${src[0]}?${Date.now()}`
        })
      }
    })
}
</script>

<template>
  <Dialog v-model:visible="openTg" modal header="Данные бота" :style="{ width: '25rem' }">
    <a href="https://t.me/lokalka_prod_release_bot" class="text underline font-semibold mb-2">Нажми, чтобы открыть бота</a><br/>
    <span class="text font-semibold">Token: {{tokenTg.token}}</span>
  </Dialog>
  <main class="flex items-center justify-center gap-2">
    <div
      class="p-card relative mt-8 flex w-[300px] flex-col items-center justify-center gap-2 rounded-xl bg-gray-400/20 p-4"
    >
      <Button
        severity="danger"
        icon="pi pi-sign-out"
        @click="leave"
        variant="text"
        class="!absolute right-2 top-2"
      ></Button>

      <img
        :src="API + '/avatar'"
        alt="Аватарка пользователя"
        class="user-avatar h-40 w-40 select-none rounded-full object-cover"
      />
      <FileUpload
        v-if="isEditing"
        :customUpload="true"
        :multiple="false"
        mode="basic"
        accept="image/*"
        :maxFileSize="1000000"
        @uploader="uploadAvatar"
        :auto="true"
        choose-icon="pi pi-cloud-upload"
        chooseLabel="Загрузить аватар"
      />
      <div class="flex w-full flex-col items-center gap-4" v-if="!isEditing">
        <span
          class="w-full overflow-hidden rounded-md !bg-[var(--p-form-field-background)] p-4 text-2xl"
          >{{ user?.first_name }} <i v-if="user?.verified" class="pi pi-verified"></i
        ></span>

        <span
          class="w-full overflow-hidden rounded-md !bg-[var(--p-form-field-background)] p-4 text-2xl"
          >{{ user?.email }}</span
        >
      </div>
      <Form
        @submit="edit"
        v-slot="form"
        v-if="isEditing"
        :initialValues="user"
        :resolver="resolver"
        :validateOnValueUpdate="false"
        :validateOnBlur="true"
        class="flex flex-col items-center"
      >
        <div class="mb-6">
          <InputText
            type="text"
            name="first_name"
            class="!block !w-full !appearance-none !p-4 !text-xl"
            placeholder="Ваше имя"
          />
          <Message
            v-if="form.first_name?.invalid"
            size="small"
            severity="error"
            variant="simple"
            class="ml-4"
          >
            {{ form.first_name.error.message }}
          </Message>
        </div>
        <div class="mb-6">
          <InputText
            type="text"
            name="email"
            class="!block !w-full !appearance-none !p-4 !text-xl"
            placeholder="Email"
          />
          <Message
            v-if="form.email?.invalid"
            size="small"
            severity="error"
            variant="simple"
            class="ml-4"
          >
            {{ form.email.error.message }}
          </Message>
        </div>
        <Button variant="outlined" type="submit" label="Сохранить" severity="success" />
      </Form>
      <div>
        <Button
          severity="info"
          icon="pi pi-pencil"
          @click="isEditing = !isEditing"
          variant="text"
        ></Button>
        <Button
          severity="info"
          icon="pi pi-telegram"
          v-if="user?.role === 'admin'"
          @click="openTg = !openTg"
          variant="text"
        ></Button>
      </div>
    </div>
    <div
      v-if="isLoading"
      class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75"
    >
      <i class="pi pi-spin pi-spinner text-4xl text-white"></i>
    </div>
  </main>
</template>

<style scoped></style>
