<template>
  <div class="card">
    <DataTable
      v-model:editingRows="editingRows"
      :value="users"
      editMode="row"
      dataKey="id"
      @row-edit-save="onRowEditSave"
      :pt="{
        table: { style: 'min-width: 50rem' },
        column: {
          bodycell: ({ state }) => ({
            style: state['d_editing'] && 'padding-top: 0.75rem; padding-bottom: 0.75rem',
          }),
        },
      }"
    >
      <Column field="first_name" header="Имя" style="width: 20%">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" fluid />
        </template>
      </Column>
      <Column field="email" header="Почта" style="width: 20%">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" fluid />
        </template>
      </Column>
      <Column field="verified" header="Верифицирован" style="width: 20%">
        <template #editor="{ data, field }">
          <ToggleSwitch v-model="data[field]" />
        </template>
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.verified ? 'Да' : 'Нет'"
            :severity="getStatusLabel(slotProps.data.verified)"
          />
        </template>
      </Column>
      <Column field="role" header="Роль" style="width: 20%">
        <template #body="{ data, field }">
          <Tag :value="data[field]" />
        </template>
        <template #editor="{ data, field }">
          <Select
            v-model="data[field]"
            :options="roles"
            optionLabel="name"
            optionValue="value"
            placeholder="Select a Status"
            fluid
          >
            <template #option="slotProps">
              <Tag :value="slotProps.option.name" />
            </template>
          </Select>
        </template>
      </Column>
      <Column
        :rowEditor="true"
        style="width: 10%; min-width: 8rem"
        bodyStyle="text-align:center"
      ></Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import instance from '~/axiosInstance.js'

definePageMeta({
  middleware: 'admin',
  requireAuth: false,
})

const users = ref()
const editingRows = ref([])
const columns = ref([
  { field: 'first_name', header: 'Имя' },
  { field: 'email', header: 'Почта' },
  { field: 'verified', header: 'Верифицирован' },
  { field: 'role', header: 'Роль' },
])

const roles = ref([
  { name: 'Админ', value: 'admin' },
  { name: 'Пользователь', value: 'user' },
])

onMounted(async () => {
  users.value = (await instance.get('/admin/users')).data
})

const onRowEditSave = (event) => {
  let { newData, index } = event

  users.value[index] = newData
  instance.patch(`/admin/user/${newData.id}`, newData)
}

const getStatusLabel = (value) => {
  if (value) {
    return 'success'
  }
  return 'danger'
}
</script>
