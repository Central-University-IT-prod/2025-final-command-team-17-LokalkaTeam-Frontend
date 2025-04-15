<script setup lang="ts">
import instance from '~/axiosInstance';
import { useToast } from 'primevue';

const toast = useToast();

const onSubmitData = (data: any) => {
  data.forEach((item: any) => {
    instance.patch(`/seat/${item.id}`, item).catch((err) => console.error(err))
  });
  toast.add({
    severity: 'success',
    summary: 'Успешно',
    detail: "Сохранено",
    life: 2500,
  })
}
</script>

<template>
  <Toast />
  <Map :editing="true" @update="onSubmitData"></Map>
</template>

<style scoped></style>
