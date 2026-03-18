<template>
  <div class="w-full">
    <data-grid
      track-by="guid"
      ref="templatesGrid"
      id="templatesGrid"
      :columns="columns"
      @delete-row="deleteItem"
      :allow-add-new="true"
      :useCard="useCard"
      @new-row="newItem"
      async-url="/api/v1/sales/templates"
      new-item-text="Click to create new Template"
      :multi-select="false"
      @row-clicked="showTemplate"
      :settings="{ RowOrderChangeable: false }"
    >
    </data-grid>

    <delete-confirmation-dialog
      ref="deleteWarning"
      id="deleteWarning"
      :is-deleting="isDeleting"
      title="Delete Sales Template"
      :message="'Are you sure you want to delete the ' + selectedItem.name + ' sales template?'"
      @confirm-delete="deleteItem"
    >
    </delete-confirmation-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import DataGrid from './controls/grid/DataGrid.vue'
import DeleteConfirmationDialog from './controls/DeleteConfirmationDialog.vue'
import SalesTemplate from '../models/sales/SalesTemplate'

const props = defineProps<{
  useCard?: boolean
}>()

const templatesGrid = ref<any>(null)
const deleteWarning = ref<any>(null)
const selectedItem = ref(new SalesTemplate())
const isDeleting = ref(false)

const columns = [
  { field: 'name', width: 4, format: { type: 'string' }, title: 'Name', class: '' },
  { field: 'customerOrderNo', width: 3, format: { type: 'string' }, title: 'Order#', class: '' },
  { field: 'memo', width: 5, format: { type: 'string' }, title: 'Memo', class: 'text-start' }
]

const newItem = () => {
  window.location.href = '/accounts/salestemplates/create'
}

const showTemplate = (row: any) => {
  window.location.href = `/accounts/salestemplates/${row.guid}`
}

const saved = (item: any) => {
  templatesGrid.value?.updateObject(item)
}

const deleteItem = (item: any, e?: MouseEvent) => {
  if (!e || e.ctrlKey) {
    isDeleting.value = true
    axios.delete(`/api/v1/sales/templates/${item.guid}`).then((response) => {
      console.log(response)
      if (response.status === 200) {
        templatesGrid.value?.asyncDeleteRow(item.guid)
      }
      isDeleting.value = false
    })
  } else {
    deleteWarning.value?.show(
      item,
      'Delete Sales Template',
      `Are you sure you want to delete the ${item.name} sales template?`
    )
  }
}
</script>

<style>

</style>
