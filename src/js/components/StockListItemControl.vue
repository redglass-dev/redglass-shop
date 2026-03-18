<template>
  <div class="w-full h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div class="relative w-full aspect-square bg-gray-50 flex items-center justify-center cursor-pointer" @click="$emit('more-info')">
      <template v-if="localStock.wideImage">
        <img
          class="w-full h-full object-contain"
          :src="localStock.wideImage.uriLink"
          :alt="localStock.wideImage.description"
        />
        <div v-if="localStock.unAvailable" class="absolute bottom-0 left-0 bg-red-600 px-2 py-1">
          <span class="text-xs font-bold text-white uppercase">{{ localStock.unavailableLabel }}</span>
        </div>
      </template>
      <div v-else class="text-gray-200 text-6xl font-bold uppercase select-none">
        {{ localStock.stockDescription?.toUpperCase()[0] || '?' }}
      </div>
    </div>

    <div class="p-3 flex-grow flex flex-col">
      <div class="cursor-pointer mb-2" @click="$emit('more-info')">
        <slot name="title" :text="localStock.stockDescription">
          <h5 class="text-sm font-semibold text-gray-900 line-clamp-2">
            {{ localStock.stockDescription }}
          </h5>
        </slot>
      </div>

      <div v-if="showPrices" class="mt-auto mb-3">
        <slot name="price" :stock="localStock" :has-surface-area="localStock.surfaceArea > 0">
          <div class="text-right">
            <div v-if="localStock.surfaceArea > 0">
              <div :class="{ 'line-through opacity-50': localStock.onSale && localStock.accountInc >= localStock.saleInc }">
                <span class="text-lg font-bold text-gray-900">
                  ${{ ((localStock.onSale && localStock.accountInc == localStock.saleInc) ? (localStock.retailInc / localStock.defaultCoverage) : (localStock.accountInc / localStock.defaultCoverage)).toFixed(2) }}
                  <span class="text-[0.65rem] align-baseline">m<sup>2</sup></span>
                </span>
              </div>
              <div class="text-[0.65rem] text-gray-500">
                <span v-if="localStock.boxesPerPallet > 0">
                  ${{ ((localStock.onSale && localStock.accountInc == localStock.saleInc) ? (localStock.retailInc * localStock.boxesPerPallet) : (localStock.accountInc * localStock.boxesPerPallet)).toFixed(2) }}
                  {{ localStock.unitType?.palletName || 'Pallets' }}
                </span>
                <br />
                <span>
                  ${{ ((localStock.onSale && localStock.accountInc == localStock.saleInc) ? localStock.retailInc : localStock.accountInc).toFixed(2) }}
                  <span v-if="showUnitType">{{ localStock.unitType?.name || 'Each' }}</span>
                </span>
              </div>
            </div>
            <div v-else>
              <div :class="{ 'line-through opacity-50': localStock.onSale && localStock.accountInc >= localStock.saleInc }">
                <span class="text-lg font-bold text-gray-900">
                  ${{ ((localStock.onSale && localStock.accountInc == localStock.saleInc) ? localStock.retailInc : localStock.accountInc).toFixed(2) }}
                  <span v-if="showUnitType" class="text-[0.65rem] align-baseline">{{ localStock.unitType?.name || 'Each' }}</span>
                </span>
              </div>
              <div v-if="localStock.onSale && localStock.accountInc >= localStock.saleInc" class="text-lg font-bold text-red-600">
                ${{ localStock.saleInc.toFixed(2) }}
              </div>
            </div>
          </div>
        </slot>
      </div>

      <div class="space-y-2 mt-auto">
        <button
          v-if="showMoreInfoButton"
          type="button"
          class="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          @click="$emit('more-info')"
        >
          More Info
        </button>

        <div v-if="showBuyButtons">
          <div v-if="localStock.unAvailable" class="w-full border border-red-200 bg-red-50 p-2 text-center text-red-700 text-xs font-bold uppercase rounded-md">
            {{ localStock.unavailableLabel }}
          </div>
          <div v-else class="flex rounded-md shadow-sm">
            <span v-if="showUnitType" class="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-[0.65rem]">
              {{ localStock.unitType?.name || 'Qty' }}
            </span>
            <input
              type="text"
              class="flex-1 block w-full border-gray-300 text-left text-sm px-3 ring-1 ring-inset ring-gray-300 outline-0 focus:ring-gray-600 focus:border-gray-600"
              :class="showUnitType ? '' : 'rounded-l-md'"
              v-model="qty"
              pattern="[0-9]*"
            />
            <button
              type="button"
              class="inline-flex items-center px-3 py-2 border border-l-0 border-transparent text-xs font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              @click="buy"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Big from 'big.js'
import { push } from 'notivue'
import axios from 'axios'
import Stock from '../models/stock/Stock'
import { useCartStore } from '../stores/CartStore'
import { StockItem as StockItemModel } from '../Cart'
import { FormErrors } from '../Form'

const props = defineProps<{
  stockGuid?: string
  stock?: any
  showStockWeight?: boolean
  accountGuid?: string
  showMoreInfoButton?: boolean
  imageBoxClass?: string | string[] | Record<string, any>
  imageBoxStyle?: string | Record<string, any>
  btnClass?: string
  infoBtnClass?: string
  showBuyButtons?: boolean
  showPrices?: boolean
  priceOnTitleRow?: boolean
  showUnitType?: boolean
}>()

const emit = defineEmits<{
  (e: 'more-info'): void
  (e: 'added-to-cart'): void
}>()

const store = useCartStore()
const cart = store.cart
const qty = ref(1)
const loading = ref(false)
const localStock = ref(new Stock())
const errors = ref(new FormErrors())

const loadStock = (stock: any) => {
  localStock.value = new Stock(stock)
}

onMounted(async () => {
  if (props.stock) {
    loadStock(props.stock)
    return
  }

  if (props.stockGuid) {
    loading.value = true
    try {
      const response = await axios.get(`/api/v1/public/stocks/${props.stockGuid}`)
      loadStock(response.data)
    } catch (error) {
      console.error('Failed to load stock for list item', error)
    } finally {
      loading.value = false
    }
  }
})

watch(
  () => props.stock,
  (val) => {
    if (val) loadStock(val)
  }
)

const buy = () => {
  if (localStock.value.options && localStock.value.options !== '') {
    emit('more-info')
    return
  }

  const q = Number(qty.value)
  if (isNaN(q)) {
    errors.value.record({ qty: ['Not a number'] })
  } else if (q <= 0) {
    errors.value.record({ qty: ['Purchase qty must be positive!'] })
  } else {
    const item = new StockItemModel()
    item.stockGuid = localStock.value.guid
    item.name = localStock.value.stockDescription
    item.value = Big(localStock.value.accountInc)
    item.weight = localStock.value.boxWeight
    item.Qty = q

    cart.addItem('stockItem', String(localStock.value.guid), item)
    emit('added-to-cart')
    push.success(`${q} ${localStock.value.stockDescription} added to cart`)
  }
}
</script>

<style scoped>
.rounded-left-0 {
    border-bottom-left-radius: 0 !important;
    border-top-left-radius: 0 !important;
}

.placeholder-text {
    color: grey;
    opacity: 25%;
    font-size: 10vh;
    text-align: center;
    text-decoration: none !important;
    margin-bottom: 14px;
}

</style>
