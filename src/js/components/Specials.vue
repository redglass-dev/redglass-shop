<template>
  <div class="w-full">
    <div class="grid grid-cols-12 gap-2">
      <div v-for="(stock, key) in records.data" :key="stock.guid" :class="['p-1', colSpanClass]">
        <slot
          v-bind:stock="stock"
          v-bind:buy="buy"
          v-bind:getSpecialPrice="getSpecialPrice"
          v-bind:showBuyButtons="showBuyButtons"
          v-bind:showPrices="showPrices"
          name="item"
        >
          <div class="h-full bg-white rounded-lg border shadow-sm flex flex-col overflow-hidden">
            <img v-if="stock.wideImage !== null" class="w-full h-48 object-cover" :src="stock.wideImage.urlLink" />
            <div class="p-4 flex-grow flex flex-col justify-between">
              <div>
                <h5 class="text-md font-bold text-gray-900 mb-1">({{ stock.stockPlu }}) {{ stock.stockDescription }}</h5>
                <p class="text-sm text-gray-600 line-clamp-3">{{ stock.webDescription }}</p>
              </div>

              <div class="mt-4 flex items-center justify-between gap-2">
                <div class="flex-1 text-right">
                  <span v-if="showPrices" class="text-sm">
                    <strong class="text-gray-900">${{ getSpecialPrice(stock).toFixed(2) }}</strong>
                    <sub class="text-gray-500">(total)</sub>
                  </span>
                </div>
                <div v-if="showBuyButtons" class="flex-shrink-0 w-32">
                  <div class="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      class="block w-full rounded-l-md border-gray-300 text-center text-xs focus:border-indigo-500 focus:ring-indigo-500 px-1"
                      pattern="[0-9]*"
                      value="1"
                      :ref="(el) => (qtyRefs[stock.guid] = el)"
                      autocomplete="off"
                    />
                    <button
                      type="button"
                      class="inline-flex items-center px-2 py-1 border border-l-0 border-transparent text-xs font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700"
                      @click="buy(stock)"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <div v-if="showPaginator" class="mt-6 flex justify-center">
      <pagination :data="records" @pagination-change-page="loadPage" :limit="limit"></pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Big from 'big.js'
import { push } from 'notivue'
import { Bootstrap5Pagination as Pagination } from 'laravel-vue-pagination'
import { useCartStore } from '@/stores/CartStore'
import Stock from '@/models/stock/Stock'
import { StockItem } from '@/Cart'

const props = defineProps<{
  columns?: number
  limit?: number
  showPaginator?: boolean
  orderBy?: string
  sortDirection?: string
  showBuyButtons?: boolean
  showPrices?: boolean
  accountGuid?: string
  filters?: string
}>()

const store = useCartStore()
const cart = store.cart
const records = ref<any>({ data: [] })
const loading = ref(false)
const qtyRefs = ref<Record<string, any>>({})

const colSpanClass = computed(() => {
  const cols = Number(props.columns) || 3
  if (cols === 1) return 'col-span-12'
  if (cols === 2) return 'col-span-12 md:col-span-6'
  if (cols === 3) return 'col-span-12 md:col-span-4'
  if (cols === 4) return 'col-span-12 md:col-span-3'
  return 'col-span-12 md:col-span-4'
})

const getSpecialPrice = (stock: any) => {
  if (stock.accountInc <= 0) {
    return stock.specialInc
  }
  return stock.specialInc < stock.accountInc ? stock.specialInc : stock.accountInc
}

const loadPage = async (page: number = 1) => {
  loading.value = true
  let tmpFilter = '&f=onSpecial: true'
  let order = ''

  if (props.filters && props.filters !== '') {
    tmpFilter = `&f=onSpecial: true, ${props.filters}`
  }

  if (props.orderBy && props.orderBy !== '') {
    order = `&sc=${props.orderBy}&d=${props.sortDirection || 'up'}`
  }

  const limitParam = `&limit=${props.limit || 9}`
  const accountParam = props.accountGuid ? `&account=${props.accountGuid}` : ''

  try {
    const response = await axios.get(`api/v1/stocks?page=${page}${order}${limitParam}${accountParam}${tmpFilter}`)
    records.value = response.data
    records.value.data = response.data.data.map((record: any) => new Stock(record))
  } catch (error) {
    console.error('Failed to load specials', error)
  } finally {
    loading.value = false
  }
}

const buy = (stock: any) => {
  const qtyInput = qtyRefs.value[stock.guid]
  let qtyVal = qtyInput ? qtyInput.value : '1'

  if (isNaN(Number(qtyVal)) || Number(qtyVal) <= 0) {
    qtyVal = '1'
  }

  const item = new StockItem()
  item.stockGuid = stock.guid
  item.name = stock.stockDescription
  item.value = Big(getSpecialPrice(stock))
  item.weight = stock.boxWeight
  item.Qty = Number(qtyVal)

  cart.addItem('stockItem', String(item.stockGuid), item)
  push.success(`${qtyVal} ${item.name} added to cart`)
}

onMounted(() => {
  loadPage(1)
})
</script>

<style scoped>

</style>
