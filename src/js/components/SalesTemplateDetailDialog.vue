<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full flex flex-col">
      <div class="px-4 py-3 border-b flex justify-between items-center rounded-t-lg">
        <h5 class="text-lg font-bold text-gray-900">Sales Template Detail</h5>
        <button type="button" class="text-gray-400 hover:text-red-500 transition-colors" @click="close">
          <vue-feather type="x" size="1.2em"></vue-feather>
        </button>
      </div>

      <div class="p-4">
        <form @submit.prevent="onSubmit">
          <div class="space-y-4">
            <div>
              <label for="stockGuid" class="block text-sm font-medium text-gray-700 mb-1">Stock Item</label>
              <multiselect
                v-model="selectedStock"
                id="stockGuid"
                label="stockDescription"
                track-by="guid"
                placeholder="Type to search"
                open-direction="bottom"
                :options="stocks"
                :searchable="true"
                :loading="stockLoading"
                :clear-on-select="true"
                :close-on-select="true"
                :show-no-results="true"
                :allow-empty="false"
                :internal-search="false"
                deselect-label=""
                @search-change="stockSearch"
                @select="setStock"
              >
                <template #singleLabel="{ option }">{{ option.plu }} {{ option.stockDescription }}</template>
                <template #option="props">
                  <div class="py-1">
                    <span class="block text-sm font-medium text-gray-900">{{ props.option.plu }}</span>
                    <span class="block text-xs text-gray-500">{{ props.option.stockDescription }}</span>
                  </div>
                </template>
                <template #noResult>Oops! No elements found. Consider changing the search query.</template>
              </multiselect>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Default Qty</label>
              <input
                type="number"
                step="0.01"
                class="block w-full rounded-md border-gray-300 text-right shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                :class="{ 'border-red-500': form.errors.has('qty') }"
                v-model.number="form.qty"
                @input="form.errors.clear('qty')"
              />
              <p v-if="form.errors.has('qty')" class="mt-1 text-xs text-red-600">{{ form.errors.get('qty') }}</p>
            </div>
          </div>
        </form>
      </div>

      <div class="px-4 py-3 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
        <button
          type="button"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          :disabled="isDeleting"
          @click="deleteRow"
        >
          <vue-feather v-if="isDeleting" type="loader" animation="spin" animation-speed="fast" size="1em" class="mr-2"></vue-feather>
          Delete
        </button>
        <div class="flex space-x-2">
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="close"
          >
            Close
          </button>
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            :disabled="isSaving"
            @click="onSubmit"
          >
            <vue-feather v-if="isSaving" type="loader" animation="spin" animation-speed="fast" size="1em" class="mr-2"></vue-feather>
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import Form from './libraries/jl-general/helpers/Form'
import Stock from './libraries/jl-data-objects/Stock/Stock'
import Big from 'big.js'
import Multiselect from 'vue-multiselect'

const props = defineProps<{
  id: string
  detail: any
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'on-saved', detail: any): void
  (e: 'delete-row', detail: any): void
  (e: 'close'): void
}>()

const form = ref(new Form({}))
const stockLoading = ref(false)
const isDeleting = ref(false)
const stocks = ref<any[]>([])
const currentStock = ref<any>({})
const isSaving = ref(false)

const selectedStock = computed({
  get: () => {
    currentStock.value = stocks.value.find((option) => option.guid === form.value.stockGuid)
    return currentStock.value
  },
  set: (value: any) => {
    if (value != null) {
      form.value.stockGuid = value.guid
    } else {
      form.value.stockGuid = ''
    }
  }
})

watch(
  () => props.detail,
  (newValue) => {
    if (newValue != null) {
      form.value = new Form(newValue)
      getStock(newValue.stockGuid)
    }
  },
  { immediate: true }
)

const onSubmit = async () => {
  isSaving.value = true
  let url = `/api/v1/sales/templates/${props.detail.salesTemplateGuid}/details`
  const method = form.value.guid !== '' ? 'put' : 'post'

  if (form.value.guid !== '') {
    url = `${url}/${form.value.guid}`
  }

  try {
    const response = await form.value[method](url, axios)
    props.detail.update(response.object)
    form.value = new Form(props.detail)
    emit('on-saved', props.detail)
    close()
  } catch (error) {
    console.error('Failed to save detail', error)
  } finally {
    isSaving.value = false
  }
}

const setStock = (item: any) => {
  const stock = new Stock(item)
  form.value.description = stock.stockDescription
  form.value.taxGuid = stock.taxGuid
  form.value.unitTax = stock.accountTax
  form.value.unitPrice = stock.accountEx
  form.value.unitPriceInc = stock.accountInc
  form.value.locationGuid = stock.defaultLocationGuid
  form.value.unitCostPrice = stock.costEx
}

const stockSearch = (query: string) => {
  if (query === '') return

  stockLoading.value = true
  axios.get(`/api/v1/stocks/search/${query}?limit=50`).then((response) => {
    stocks.value = response.data.data
    if (currentStock.value) {
      stocks.value.unshift(currentStock.value)
    }
    stockLoading.value = false
  })
}

const getStock = (id: string) => {
  if (!id || id === '') return

  stockLoading.value = true
  axios.get(`/api/v1/stocks/${id}`).then((response) => {
    currentStock.value = response.data
    stocks.value = [currentStock.value]
    stockLoading.value = false
  })
}

const deleteRow = () => {
  emit('delete-row', props.detail)
}

const close = () => {
  emit('close')
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style>

</style>
