<template>
  <div class="w-full">
    <div :class="[useCard ? 'bg-white rounded-lg border shadow-sm' : '', 'mb-2']">
      <div :class="[useCard ? 'p-4' : '', 'space-y-4']">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 border-b mb-1">Name</label>
            <input
              name="name"
              id="name"
              type="text"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              @change="save"
              v-model="form.name"
            />
          </div>
          <div>
            <label for="memo" class="block text-sm font-medium text-gray-700 border-b mb-1">Memo</label>
            <input
              name="memo"
              id="memo"
              type="text"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              @change="save"
              v-model="form.memo"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-2 mb-2">
      <button
        type="button"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
        :disabled="!allowExport"
        @click="clear"
      >
        Clear
      </button>
      <button
        type="button"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="useDefaults"
      >
        Default Qty's
      </button>
      <button
        type="button"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        @click="addToCart"
      >
        Add to Cart
      </button>
    </div>

    <data-grid
      ref="detailsGrid"
      class="rg-sales-template-details"
      track-by="guid"
      :columns="columns"
      :records="details"
      @row-clicked="showDetail"
      @new-row="newDetail"
      @delete-row="deleteDetail"
      :total-row-limit="250"
      :use-card="useCard"
      :dynamic-height="true"
      :draggable="true"
      row-index-field="itemNum"
      @row-changed="updateDetail"
      :show-running-totals="true"
      :update-settings="saveDetailGridSettings"
      :allow-row-focus="false"
      :settings="detailGridSettings"
    >
    </data-grid>

    <div :class="[useCard ? 'bg-white rounded-lg border shadow-sm p-4' : '', 'mt-2 mb-4 flex justify-end items-center']">
      <span class="text-lg font-bold text-gray-900">Total: {{ totalValue }}</span>
    </div>

    <div class="flex justify-end space-x-2 mb-10">
      <button
        type="button"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
        :disabled="!allowExport"
        @click="clear"
      >
        Clear
      </button>
      <button
        type="button"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="useDefaults"
      >
        Default Qty's
      </button>
      <button
        type="button"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        @click="addToCart"
      >
        Add to Cart
      </button>
    </div>

    <sales-template-detail-dialog
      :id="'editDialog'"
      :detail="selectedDetail"
      :is-open="isEditModalOpen"
      @delete-row="deleteDetail"
      @on-saved="detailSaved"
      @close="isEditModalOpen = false"
    ></sales-template-detail-dialog>

    <delete-confirmation-dialog
      ref="deleteWarning"
      id="deleteWarning"
      :is-deleting="isDeleting"
      title="Delete Sales Template Detail"
      :message="'Are you sure you want to delete the ' + currentDescription + ' item?'"
      @confirm-delete="runDelete"
    >
    </delete-confirmation-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import Big from 'big.js'
import { push } from 'notivue'
import DataGrid from './libraries/rg-vue-grid/grid/DataGrid.vue'
import Form from './libraries/jl-general/helpers/Form'
import DeleteConfirmationDialog from './libraries/jl-general/DeleteConfirmationDialog.vue'
import SalesTemplate from './libraries/jl-data-objects/Sales/SalesTemplate'
import SalesTemplateDetail from './libraries/jl-data-objects/Sales/SalesTemplateDetail'
import SalesTemplateDetailDialog from './SalesTemplateDetailDialog.vue'
import Formatter from './libraries/jl-general/helpers/Formatter'

const props = defineProps<{
  salesTemplateGuid?: string
  template?: any
  useCard?: boolean
}>()

const emit = defineEmits<{
  (e: 'on-save', template: any): void
  (e: 'details-changed'): void
}>()

const detailsGrid = ref<any>(null)
const deleteWarning = ref<any>(null)
const currentTemplate = ref<any>(null)
const form = ref(new Form())
const details = ref<any[]>([])
const selectedDetail = ref<any>(null)
const isDeleting = ref(false)
const isEditModalOpen = ref(false)
const formatter = new Formatter()

const columns = [
  { field: 'description', width: 7, format: { type: 'string' }, title: 'Description', class: '' },
  { field: 'exportQty', width: 1, format: { type: 'number' }, title: 'To Cart', class: '', editor: true, editInputClass: 'grid-form-input' },
  { field: 'qty', width: 1, format: { type: 'number' }, title: 'Default', class: 'text-end', runningTotal: { functionType: 'sum', format: 'number' } },
  { field: 'unitTax', width: 1, format: 'currency', title: 'Tax', class: 'text-end d-none d-lg-block' },
  { width: 1, format: { type: 'currency' }, formula: '(unitPrice + unitTax)', title: 'Price Inc', class: 'text-end' },
  { width: 1, format: 'currency', formula: '(unitPrice + unitTax) * exportQty', title: 'Total', class: 'text-end' }
]

const detailGridSettings = ref({ RowOrderChangeable: false })

onMounted(() => {
  const savedSettings = localStorage.getItem('sale-template-details-settings')
  if (savedSettings) {
    detailGridSettings.value = JSON.parse(savedSettings)
  }

  if (props.salesTemplateGuid) {
    axios.get(`/api/v1/sales/templates/${props.salesTemplateGuid}`).then((response) => {
      currentTemplate.value = new SalesTemplate(response.data)
      form.value = new Form(currentTemplate.value)
      loadDetails()
    })
  }
})

const totalValue = computed(() => {
  let total = 0
  details.value.forEach((detail) => {
    total += detail.lineTotalInc
  })
  return formatter.format(total, 'currency')
})

const currentDescription = computed(() => {
  return selectedDetail.value ? selectedDetail.value.description : ''
})

const allowExport = computed(() => {
  return details.value.some((detail) => detail.exportQty !== 0 && detail.exportQty !== '')
})

watch(
  () => props.template,
  (newValue) => {
    if (newValue !== null && (currentTemplate.value === null || currentTemplate.value.guid !== newValue.guid)) {
      currentTemplate.value = new SalesTemplate(newValue)
      form.value = new Form(currentTemplate.value)
      loadDetails()
    }
  }
)

const loadDetails = () => {
  if (!currentTemplate.value) return
  detailsGrid.value?.setLoading(true)
  axios
    .get(`/api/v1/sales/templates/${currentTemplate.value.guid}/details?page=1&limit=1000`)
    .then((response) => {
      if (response.data) {
        details.value = response.data.map((row: any) => {
          row.exportQty = ''
          return new SalesTemplateDetail(row)
        })

        if (detailGridSettings.value.RowOrderChangeable) {
          setTimeout(() => {
            detailsGrid.value?.sorter('itemNum', false)
          }, 0)
        }
      }
      detailsGrid.value?.setLoading(false)
    })
    .catch(() => {
      detailsGrid.value?.setLoading(false)
    })
}

const save = () => {
  form.value.put(`/api/v1/sales/templates/${currentTemplate.value.guid}`, axios).then((response: any) => {
    currentTemplate.value.update(response.object)
    form.value = new Form(currentTemplate.value)
    emit('on-save', currentTemplate.value)
  })
}

const showDetail = (detail: any) => {
  selectedDetail.value = detail
  isEditModalOpen.value = true
}

const newDetail = () => {
  const detail = new SalesTemplateDetail()
  detail.setTemplate(currentTemplate.value)
  selectedDetail.value = detail
  isEditModalOpen.value = true
}

const deleteDetail = (detail: any, e?: MouseEvent) => {
  selectedDetail.value = new SalesTemplateDetail(detail)
  if (e && e.ctrlKey) {
    runDelete()
  } else {
    deleteWarning.value?.show()
  }
}

const runDelete = () => {
  isDeleting.value = true
  const index = details.value.findIndex((option) => option.guid === selectedDetail.value.guid)
  if (index < 0) {
    isDeleting.value = false
    return
  }

  axios
    .delete(`/api/v1/sales/templates/${currentTemplate.value.guid}/details/${selectedDetail.value.guid}`)
    .then((response) => {
      if (response.status === 200) {
        details.value.splice(index, 1)
      }
      isEditModalOpen.value = false
      deleteWarning.value?.hide()
      emit('details-changed')
      isDeleting.value = false
    })
}

const detailSaved = (detail: any) => {
  if (detail.hasOwnProperty('guid')) {
    const local = new SalesTemplateDetail(detail)
    const index = details.value.findIndex((item) => item.guid === local.guid)
    if (index < 0) {
      details.value.unshift(local)
    } else {
      details.value.splice(index, 1, local)
      emit('details-changed')
    }
    selectedDetail.value = details.value.find((item) => item.guid === local.guid)
  }
}

const clear = () => {
  details.value.forEach((detail) => {
    detail.exportQty = 0
  })
}

const useDefaults = () => {
  details.value.forEach((detail) => {
    detail.exportQty = Number(detail.qty).toFixed(2)
  })
}

const saveDetailGridSettings = (settings: any) => {
  detailGridSettings.value = settings
  localStorage.setItem('sale-template-details-settings', JSON.stringify(settings))
}

const updateDetail = (detail: any) => {
  axios.put(`/api/v2/sales/templates/${currentTemplate.value.guid}/details/${detail.guid}`, detail)
}

const addToCart = () => {
  let qty = Big(0)
  let message = ''
  let failedMessage = ''
  details.value.forEach((detail) => {
    try {
      if (detail.exportQty === '') return

      if (isNaN(detail.exportQty)) {
        failedMessage += `${detail.exportQty}x ${detail.description} - To Cart Qty is not a number<br />`
        return
      }

      if (detail.exportQty > 0) {
        const tmpQty = detail.exportQty + ''
        qty = qty.add(Big(tmpQty.trim()))
        if (
          (window as any).Cart.addStockItem(
            detail.stockGuid,
            detail.description,
            detail.exportQty,
            Big(detail.unitPrice).plus(Big(detail.unitTax)).round(2),
            0,
            false
          )
        ) {
          detail.exportQty = ''
          message += `${tmpQty}x ${detail.description}<br />`
        } else {
          failedMessage += `${detail.exportQty}x ${detail.description} - Failed to add item<br />`
        }
      }
    } catch (e: any) {
      failedMessage += `${detail.exportQty}x ${detail.description} - ${e.message}<br />`
    }
  })

  ;(window as any).Cart.save()

  if (message !== '') {
    push.success(`<strong>Added ${qty} item(s) to Cart:</strong><br />${message}`)
  }

  if (failedMessage !== '') {
    push.error(`<strong>Failed to write to cart the following:</strong><br />${failedMessage}`)
  }
}
</script>
