<template>
  <div class="w-full redglass-stock-card-list">
    <div class="flex flex-col lg:flex-row gap-4">
      <div v-if="showFilters && hasCharacteristicGroups" class="w-full lg:w-1/4 xl:w-1/5">
        <stock-characteristic-filter-panel
          ref="filterPanel"
          :filter="filter"
          :filterGroupHeaderClass="filterGroupHeaderClass"
          @filter-changed="updateFilter"
          @no-characteristic-groups="hasCharacteristicGroups = false"
        ></stock-characteristic-filter-panel>
      </div>
      <div class="flex-grow">
        <div class="mb-4">
          <div class="flex rounded-md shadow-sm">
            <input
              type="text"
              id="query"
              name="query"
              class="block w-full rounded-l-md border-0 py-1.5 ps-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-0 focus:ring-1 focus:ring-gray-600 sm:text-sm sm:leading-6"
              v-model="search"
              @keypress.enter="asyncLoad(1)"
              placeholder="Search"
            />
            <button
              class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
              @click="asyncLoad(1)"
            >
              Find
            </button>
          </div>
        </div>

        <div :class="['grid gap-4', gridColsClass]">
          <div v-for="s in asyncPage.data" :key="s.guid" class="py-1">
            <stock-item-control
              :show-unit-type="showUnitType"
              :image-box-class="imageBoxClass"
              :jump-to-page="jumpToPage"
              :stock="s"
              :show-buy-buttons="showBuyButtons"
              :show-prices="showPrices"
              :return-url="returnUrl"
            >
              <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope || {}" />
              </template>
            </stock-item-control>
          </div>
        </div>

        <div v-if="asyncPage.total > 0" class="mt-8 flex justify-center">
          <pagination :data="asyncPage" @pagination-change-page="asyncLoad" :limit="2"></pagination>
        </div>
      </div>
    </div>

    <stock-item-control
      :show-unit-type="showUnitType"
      :image-box-class="imageBoxClass"
      ref="stockItemRef"
      :jump-to-page="jumpToPage"
      :stock="stock"
      :hide-in-list="true"
      :show-buy-buttons="showBuyButtons"
      :show-prices="showPrices"
    >
      <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope || {}" />
      </template>
    </stock-item-control>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Bootstrap5Pagination as Pagination } from 'laravel-vue-pagination'
import Stock from '../models/stock/Stock'
import StockCharacteristicFilterPanel from './StockCharacteristicFilterPanel.vue'
import StockItemControl from './StockItemControl.vue'

const props = defineProps<{
  imageBoxClass?: string | string[] | Record<string, any>
  filterGroupHeaderClass?: string
  columnsSm?: number
  columnsMd?: number
  filter?: string
  query?: string
  limitRows?: number
  showFilters?: boolean
  showBuyButtons?: boolean
  showPrices?: boolean
  showStockKey?: string
  returnUrl?: string
  data?: any
  jumpToPage?: boolean
  showUnitType?: boolean
}>()

const emit = defineEmits<{
  (e: 'page-loaded', page: any): void
}>()

const errorLoading = ref(false)
const loading = ref(false)
const search = ref(props.query || '')
const asyncPage = ref<any>({ data: [] })
const asyncUrl = "/api/v1/public/stocks"
const filters = ref('')
const hasCharacteristicGroups = ref(true)
const stock = ref(new Stock())
const searchStockKey = ref(props.showStockKey)
const stockItemRef = ref<any>(null)

const gridColsClass = computed(() => {
  const sm = props.columnsSm || 2
  const md = props.columnsMd || 4
  return `grid-cols-1 sm:grid-cols-${sm} md:grid-cols-${md}`
})

const updateFilter = (val: string) => {
  if (!props.filter || props.filter === '') {
    filters.value = val
  } else if (!val || val === '') {
    filters.value = props.filter
  } else {
    filters.value = `${props.filter},${val}`
  }
  asyncLoad(1)
}

const asyncLoad = async (page: number = 1) => {
  errorLoading.value = false
  loading.value = true

  let limit = (props.limitRows || 4) * (props.columnsMd || 4)
  if (asyncPage.value.per_page) {
    limit = asyncPage.value.per_page
  }

  const searchString = search.value ? `&s=${search.value.toLowerCase().replace(/ /g, '+')}` : ''
  const tmpFilter = filters.value ? `&f=${filters.value}` : ''

  if (searchStockKey.value && props.data) {
    stock.value = new Stock(props.data)
    asyncPage.value = {
      current_page: 1,
      to: 1,
      total: 1,
      from: 1,
      last_page: 1,
      data: [stock.value]
    }
    loading.value = false
    return
  }

  try {
    const response = await axios.get(
      `${asyncUrl}?page=${page}${searchString}${tmpFilter}&per_page=${limit}`
    )
    asyncPage.value = response.data
    asyncPage.value.data = response.data.data.map((record: any) => new Stock(record))

    emit('page-loaded', asyncPage.value)

    if (searchStockKey.value) {
      const found = asyncPage.value.data.find((obj: any) => obj.guid === searchStockKey.value)
      if (found) {
        stock.value = found
        setTimeout(() => {
          stockItemRef.value?.showStock()
        }, 0)
      }
      searchStockKey.value = undefined
    }
  } catch (error) {
    console.error('Failed to load stock', error)
    errorLoading.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
    console.log('onMounted')
  updateFilter('') // Initial load
  if (searchStockKey.value && stock.value) {
    stockItemRef.value?.showStock()
    searchStockKey.value = undefined
    emit('page-loaded', asyncPage.value)
  }
})
</script>
