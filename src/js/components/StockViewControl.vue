<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import uuid from 'uuid-random'
import Big from 'big.js'
import axios from 'axios'
import { push } from 'notivue'
import { useCartStore } from '../stores/CartStore'
import { StockItem as StockItemModel } from '../Cart'
import Stock, {StockType} from '../models/stock/Stock'
import StockOptionControl from './StockOptionControl.vue'
import SurfaceAreaCalculator from './SurfaceAreaCalculator.vue'
import { FormErrors } from '../Form'
import {Select, SelectItem, SelectTrigger, SelectValue, SelectContent} from "./ui/select";

const props = withDefaults(defineProps<{
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
    imageBoxClass?: string | string[] | Record<string, any>
    limit?: number
}>(), {
    limit: 50,
})

const emit = defineEmits<{
    (e: 'added-to-cart'): void
}>()

const store = useCartStore()
const cart = store.cart
const qty = ref<number | string>(1)
const loading = ref(false)
const errors = ref(new FormErrors())
const localStock = ref<Stock>(new Stock())
const currentStock = ref<Stock>(new Stock())
const modalGuid = ref(uuid())
const groupingStocks = ref<Stock[]>([])
const options = ref<any[]>([])
const activeImageIndex = ref(0)

const hasImages = computed(() => (currentStock.value.images?.length || 0) > 0)
const hasSurfaceArea = computed(() => (currentStock.value.surfaceArea || 0) > 0)

const updateQty = (val: number) => {
    qty.value = val
}

const updateOptions = () => {
    options.value = []
    if (currentStock.value.options && currentStock.value.options !== '') {
        try {
            const tmpOptions = JSON.parse(`[${currentStock.value.options}]`)
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
    // @ts-ignore
    loadCurrentStock(localStock.value)
    if(localStock.value.type == StockType.Group)
    {
        axios.get(`/api/v1/public/stocks/${localStock.value.primaryStockGuid}`)
            .then(response => {
                console.log("Current stock item loaded", response.data)
                loadCurrentStock(new Stock(response.data))
            })
            .catch(error => {
                console.error('Failed to load stock detail', error)
            })

        let join = [{
            joinType: 'join',
            table: "acc_stock_groupings_stocks",
            localKey: "guid",
            foreignKey: "stockGuid",
        }]

        let url = `/api/v1/public/stocks?limit=${props.limit}&h=false&f=nonStockItem:false,type:${StockType.Stock},groupingStockGuid|acc_stock_groupings_stocks|guid|stockGuid|join:${localStock.value.guid}`
        console.log('url', url)
        axios.get(url)
            .then(response => {
                console.log('response', response.data)
                groupingStocks.value = []
                for(let item of response.data.data) {
                    groupingStocks.value.push(new Stock(item))
                }
            })
    }
}

function loadCurrentStock(stock: Stock) {
    currentStock.value = stock
    updateOptions()
}

onMounted(async () => {
    console.log('props', props)
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
        item.stockGuid = currentStock.value.guid
        item.name = currentStock.value.stockDescription + getSelectedOptions()
        item.value = Big(currentStock.value.accountInc)
        item.weight = currentStock.value.boxWeight
        item.Qty = q

        cart.addItem('stockItem', String(currentStock.value.guid), item)
        emit('added-to-cart')
        push.success(`${q} ${currentStock.value.stockDescription} added to cart`)
    }
}

defineExpose({
    update: updateOptions
})
</script>

<template>
  <div :class="['flex flex-col lg:flex-row overflow-hidden', rowClass]" :style="rowStyle">
    <div v-if="hasImages" class="w-full lg:w-1/2 p-0 lg:border-r border-gray-200" :style="`min-width: ${imageMinWidth}`">
      <slot name="carousel-header"></slot>

      <div class="relative group">
        <div class="relative aspect-square overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-in-out h-full"
            :style="{ transform: `translateX(-${activeImageIndex * 100}%)` }"
          >
            <div v-for="(item, index) in currentStock.images" :key="index" class="w-full h-full shrink-0 flex items-center justify-center" :class="imageBoxClass">
              <img class="max-h-full max-w-full object-contain"
                   :src="`/storage/stocks/${item.stockGuid}/images/${item.guid}.jpg`"
                   :alt="item.description"
              />
            </div>
          </div>
        </div>

        <!-- Thumbnails / Indicators -->
        <div class="flex flex-wrap justify-center gap-2 p-4 border-t border-gray-100">
          <button
            v-for="(item, index) in currentStock.images"
            :key="index"
            class="relative w-16 h-16 rounded overflow-hidden transition-all ring-0 outline-0 border-0"
            :class="activeImageIndex === index ? 'border-(--ring-color) ring-1 ring-(--ring-color)/20' : 'border-transparent hover:border-gray-300'"
            @click="activeImageIndex = index"
          >
            <img class="w-full h-full object-cover"
                 :src="`/storage/stocks/${item.stockGuid}/images/${item.guid}.jpg`"
                 :alt="item.description"
            />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="w-full lg:w-1/2 p-0 lg:border-r border-gray-200 flex flex-col">
      <slot name="carousel-header"></slot>
      <div class="grow flex items-center justify-center min-h-[300px]">
        <h2 class="text-gray-200 text-[35vh] font-bold uppercase select-none leading-none">
          {{ currentStock.stockDescription?.toUpperCase()[0] || '?' }}
        </h2>
      </div>
    </div>

    <div class="grow flex flex-col p-4 md:p-6 lg:p-8">
      <div class="grow">
        <slot name="card-header"></slot>
        <slot name="title" :text="currentStock.stockDescription">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            {{ currentStock.stockDescription }}
          </h1>
        </slot>
          <Select v-if="localStock.type == StockType.Group"
                  v-model="currentStock.guid">
              <SelectTrigger class="mb-4">
                  <SelectValue v-model="currentStock.guid" />
              </SelectTrigger>

              <SelectContent class="border-gray-300 bg-white redglass-input">
                  <SelectItem v-for="item in groupingStocks" :key="item.guid" :value="item.guid" @select="loadCurrentStock(item)">
                      {{ item.stockDescription }}
                      <div v-if="showPrices">
                          <span v-if="hasSurfaceArea">${{ ((item.onSale && item.accountInc == item.saleInc) ? (item.retailInc / item.defaultCoverage) : (item.accountInc / item.defaultCoverage)).toFixed(2) }}</span>
                          <span v-else>${{ ((item.onSale && item.accountInc == item.saleInc) ? item.retailInc : item.accountInc).toFixed(2) }}</span>
                      </div>
                  </SelectItem>
              </SelectContent>
          </Select>

        <div v-if="showPrices" class="mb-6">
          <slot name="price" :stock="currentStock" :has-surface-area="hasSurfaceArea">
            <div class="text-right lg:text-left">
              <div v-if="hasSurfaceArea">
                <div :class="{ 'line-through opacity-50': currentStock.onSale && currentStock.accountInc >= currentStock.saleInc }">
                  <span class="text-3xl font-bold text-gray-900">
                    ${{ ((currentStock.onSale && currentStock.accountInc == currentStock.saleInc) ? (currentStock.retailInc / currentStock.defaultCoverage) : (currentStock.accountInc / currentStock.defaultCoverage)).toFixed(2) }}
                    <span class="text-sm align-baseline">m<sup>2</sup></span>
                  </span>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  <span v-if="currentStock.boxesPerPallet > 0">
                    ${{ ((currentStock.onSale && currentStock.accountInc == currentStock.saleInc) ? (currentStock.retailInc * currentStock.boxesPerPallet) : (currentStock.accountInc * currentStock.boxesPerPallet)).toFixed(2) }}
                    {{ currentStock.unitType?.palletName || 'Pallets' }}
                  </span>
                  <br />
                  <span>
                    ${{ ((currentStock.onSale && currentStock.accountInc == currentStock.saleInc) ? currentStock.retailInc : currentStock.accountInc).toFixed(2) }}
                    <span v-if="showUnitType">{{ currentStock.unitType?.name || 'Each' }}</span>
                  </span>
                </div>
              </div>
              <div v-else>
                <div :class="{ 'line-through opacity-50': currentStock.onSale && currentStock.accountInc >= currentStock.saleInc }">
                  <span class="text-3xl font-bold text-gray-900">
                    ${{ ((currentStock.onSale && currentStock.accountInc == currentStock.saleInc) ? currentStock.retailInc : currentStock.accountInc).toFixed(2) }}
                    <span v-if="showUnitType" class="text-sm align-baseline">{{ currentStock.unitType?.name || 'Each' }}</span>
                  </span>
                </div>
                <div v-if="currentStock.onSale && currentStock.accountInc >= currentStock.saleInc" class="text-3xl font-bold text-red-600 mt-1">
                  ${{ currentStock.saleInc.toFixed(2) }}
                </div>
              </div>
            </div>
          </slot>
        </div>

        <div class="prose prose-sm max-w-none text-gray-600 mb-8" v-html="currentStock.webDescription"></div>
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
          <surface-area-calculator :stock="currentStock" @qty-updated="updateQty" :qty="qty"></surface-area-calculator>
        </div>
      </div>

      <!-- Buy Panel -->
      <div v-if="showBuyButtons && !currentStock.unAvailable" class="sticky bottom-0 border-t border-gray-100 pt-4 mt-auto">
        <div class="flex items-stretch gap-0">
          <div v-if="showUnitType" class="redglass-label-unit-type">
            {{ currentStock.unitType?.name || 'Qty' }}
          </div>
          <input
            type="text"
            class="redglass-input-qty"
            :class="showUnitType ? '' : 'rounded-l-md'"
            v-model="qty"
            pattern="[0-9]*"
          />
          <button
            class="redglass-btn-buy"
            @click="buy"
          >
            Buy Now
          </button>
        </div>
        <p v-if="errors.has('qty')" class="mt-2 text-sm text-red-600">{{ errors.get('qty') }}</p>
      </div>

      <div v-if="currentStock.unAvailable" class="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center font-bold uppercase tracking-wider mt-auto">
        {{ currentStock.unavailableLabel }}
      </div>
    </div>
  </div>
</template>
