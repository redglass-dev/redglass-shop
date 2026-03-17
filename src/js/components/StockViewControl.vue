<template>
  <div :class="['flex flex-col lg:flex-row bg-white border-0 overflow-hidden', rowClass]" :style="rowStyle">
    <div v-if="hasImages" class="w-full lg:w-1/2 p-0 lg:border-r border-gray-200" :style="`min-width: ${imageMinWidth}`">
      <slot name="carousel-header"></slot>

      <div class="relative group">
        <div class="relative aspect-square overflow-hidden bg-gray-50">
          <div
            class="flex transition-transform duration-500 ease-in-out h-full"
            :style="{ transform: `translateX(-${activeImageIndex * 100}%)` }"
          >
            <div v-for="(item, index) in localStock.images" :key="index" class="w-full h-full flex-shrink-0 flex items-center justify-center">
              <img class="max-h-full max-w-full object-contain" :src="item.uriLink" :alt="item.name" />
            </div>
          </div>
        </div>

        <!-- Thumbnails / Indicators -->
        <div class="flex flex-wrap justify-center gap-2 p-4 border-t border-gray-100 bg-white">
          <button
            v-for="(item, index) in localStock.images"
            :key="index"
            class="relative w-16 h-16 rounded overflow-hidden border-2 transition-all"
            :class="activeImageIndex === index ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent hover:border-gray-300'"
            @click="activeImageIndex = index"
          >
            <img class="w-full h-full object-cover" :src="item.uriLink" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="w-full lg:w-1/2 p-0 lg:border-r border-gray-200 bg-gray-50 flex flex-col">
      <slot name="carousel-header"></slot>
      <div class="flex-grow flex items-center justify-center min-h-[300px]">
        <h2 class="text-gray-200 text-[35vh] font-bold uppercase select-none leading-none">
          {{ localStock.stockDescription?.toUpperCase()[0] || '?' }}
        </h2>
      </div>
    </div>

    <div class="flex-grow flex flex-col p-4 md:p-6 lg:p-8">
      <div class="flex-grow">
        <slot name="card-header"></slot>
        <slot name="title" :text="localStock.stockDescription">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            {{ localStock.stockDescription }}
          </h1>
        </slot>

        <div v-if="showPrices" class="mb-6">
          <slot name="price" :stock="localStock" :has-surface-area="hasSurfaceArea">
            <div class="text-right lg:text-left">
              <div v-if="hasSurfaceArea">
                <div :class="{ 'line-through opacity-50': localStock.onSale && localStock.accountInc >= localStock.saleInc }">
                  <span class="text-3xl font-bold text-gray-900">
                    ${{ ((localStock.onSale && localStock.accountInc == localStock.saleInc) ? (localStock.retailInc / localStock.defaultCoverage) : (localStock.accountInc / localStock.defaultCoverage)).toFixed(2) }}
                    <span class="text-sm align-baseline">m<sup>2</sup></span>
                  </span>
                </div>
                <div class="text-sm text-gray-500 mt-1">
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
                  <span class="text-3xl font-bold text-gray-900">
                    ${{ ((localStock.onSale && localStock.accountInc == localStock.saleInc) ? localStock.retailInc : localStock.accountInc).toFixed(2) }}
                    <span v-if="showUnitType" class="text-sm align-baseline">{{ localStock.unitType?.name || 'Each' }}</span>
                  </span>
                </div>
                <div v-if="localStock.onSale && localStock.accountInc >= localStock.saleInc" class="text-3xl font-bold text-red-600 mt-1">
                  ${{ localStock.saleInc.toFixed(2) }}
                </div>
              </div>
            </div>
          </slot>
        </div>

        <div class="prose prose-sm max-w-none text-gray-600 mb-8" v-html="localStock.webDescription"></div>

        <!-- Options Section -->
        <div v-if="options.length > 0" class="space-y-4 border-t border-gray-100 pt-6 mb-8">
          <stock-option-control
            v-for="(group, index) in options"
            :key="index"
            :group="group"
            :selected="group.selected"
            @selection-changed="setSelectedItemInGroup"
            :use-radio-buttons="useRadioButtons"
          ></stock-option-control>
        </div>

        <div v-if="hasSurfaceArea" class="mb-8">
          <surface-area-calculator :stock="localStock" @qty-updated="updateQty" :qty="qty"></surface-area-calculator>
        </div>
      </div>

      <!-- Buy Panel -->
      <div v-if="showBuyButtons && !localStock.unAvailable" class="sticky bottom-0 bg-white border-t border-gray-100 pt-4 mt-auto">
        <div class="flex items-stretch gap-2">
          <div v-if="showUnitType" class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {{ localStock.unitType?.name || 'Qty' }}
          </div>
          <input
            type="text"
            class="flex-1 min-w-0 block w-full px-3 py-3 border-gray-300 text-center text-lg font-bold focus:ring-indigo-500 focus:border-indigo-500"
            :class="showUnitType ? '' : 'rounded-l-md'"
            v-model="qty"
            pattern="[0-9]*"
          />
          <button
            class="inline-flex items-center px-8 py-3 border border-transparent text-lg font-bold rounded-r-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm"
            @click="buy"
          >
            Buy Now
          </button>
        </div>
        <p v-if="errors.has('qty')" class="mt-2 text-sm text-red-600">{{ errors.get('qty') }}</p>
      </div>

      <div v-if="localStock.unAvailable" class="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center font-bold uppercase tracking-wider mt-auto">
        {{ localStock.unavailableLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import uuid from 'uuid-random'
import Big from 'big.js'
import axios from 'axios'
import { push } from 'notivue'
import { useCartStore } from '../stores/CartStore'
import { StockItem as StockItemModel } from '../Cart'
import Stock from '../models/stock/Stock'
import StockOptionControl from './StockOptionControl.vue'
import SurfaceAreaCalculator from './SurfaceAreaCalculator.vue'
import { FormErrors } from './libraries/jl-general/helpers/Form'

const props = defineProps<{
  stockGuid?: string
  stock?: any
  accountGuid?: string
  rowStyle?: string
  rowClass?: string
  slideInterval?: string | number
  btnClass?: string
  useRadioButtons?: boolean
  showBuyButtons?: boolean
  showPrices?: boolean
  showUnitType?: boolean
  imageMinWidth?: string
}>()

const emit = defineEmits<{
  (e: 'added-to-cart'): void
}>()

const store = useCartStore()
const cart = store.cart
const qty = ref<number | string>(1)
const loading = ref(false)
const errors = ref(new FormErrors())
const localStock = ref(new Stock())
const modalGuid = ref(uuid())
const options = ref<any[]>([])
const activeImageIndex = ref(0)

const hasImages = computed(() => (localStock.value.images?.length || 0) > 0)
const hasSurfaceArea = computed(() => (localStock.value.surfaceArea || 0) > 0)

const updateQty = (val: number) => {
  qty.value = val
}

const updateOptions = () => {
  options.value = []
  if (localStock.value.options && localStock.value.options !== '') {
    try {
      const tmpOptions = JSON.parse(`[${localStock.value.options}]`)
      options.value = tmpOptions.map((group: any) => {
        if (group && !group.hasOwnProperty('selected')) {
          group.selected = group.items[0]
        } else if (group) {
          group.selected = String(group.selected)
        }
        return group
      }).filter(Boolean)
    } catch (e) {
      console.error('Failed to parse stock options', e)
    }
  }
}

const loadStock = (stockData: any) => {
  localStock.value = new Stock(stockData)
  updateOptions()
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
      console.error('Failed to load stock detail', error)
    } finally {
      loading.value = false
    }
  }
})

watch(() => props.stock, (val) => {
  if (val) loadStock(val)
})

const getSelectedOptions = () => {
  if (options.value.length === 0) return ''
  const items = options.value.map(group => `${group.name}: ${group.selected}`)
  return ` *** Options *** ${items.join(', ')}`
}

const setSelectedItemInGroup = (args: { group: any; selected: string }) => {
  const index = options.value.findIndex(obj => obj.name === args.group.name)
  if (index !== -1) {
    options.value[index].selected = args.selected
  }
}

const buy = () => {
  const q = Number(qty.value)
  if (isNaN(q)) {
    errors.value.record({ qty: ['Not a number'] })
  } else if (q <= 0) {
    errors.value.record({ qty: ['Purchase qty must be positive!'] })
  } else {
    const item = new StockItemModel()
    item.stockGuid = localStock.value.guid
    item.name = localStock.value.stockDescription + getSelectedOptions()
    item.value = Big(localStock.value.accountInc)
    item.weight = localStock.value.boxWeight
    item.Qty = q

    cart.addItem('stockItem', String(localStock.value.guid), item)
    emit('added-to-cart')
    push.success(`${q} ${localStock.value.stockDescription} added to cart`)
  }
}

defineExpose({
  update: updateOptions
})
</script>

<!--<docs>-->
<!--```-->
<!--<stock-view-control :stock="stockItem"></stock-view-control>-->
<!--```-->
<!--</docs>-->
