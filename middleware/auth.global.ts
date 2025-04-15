import instance from '~/axiosInstance'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return
  if (to.meta.requireAuth === false) return

  try {
    const res = await instance.get('/user/me', {})
    if (!res.data) {
      console.warn('Нет данных пользователя:', res)
      return navigateTo('/auth/login')
    }
  } catch (err) {
    console.error('Ошибка проверки аутентификации:', err)
    return navigateTo('/auth/login')
  }
})
