import type { UserModel } from '~/types/userModel'
import instance from '~/axiosInstance'
import { useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp()

  try {
    const res: UserModel = (await instance.get('/user/me')).data

    if (!res || res.role !== 'admin') {
      return navigateTo('/')
    }
  } catch (err) {
    console.error('Ошибка проверки прав:', err)

    if (!nuxtApp.ssrContext) {
      return navigateTo('/')
    }
  }
})
