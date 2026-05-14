<script setup lang="ts">
import { ref, computed } from 'vue'
import Big from 'big.js'
import { push } from 'notivue'
import { useCartStore } from '../stores/CartStore'
import { StockItem as StockItemModel } from '../Cart'
import { FormErrors } from '../Form'

const props = defineProps<{
    stockGuid?: string
    price?: string | number
    stockName?: string
    stockDescription?: string
    stockPlu?: string
    weight?: number | string
    descriptionLength?: number
    minHeight?: number
    thumbnail?: string
    showPrice?: boolean
    showBuyButton?: boolean
    showPlu?: boolean
    allowPopup?: boolean
    images?: string[]
    headerClass?: string
    headerStyle?: string
    headerImageHeight?: number
    titleClass?: string
    titleStyle?: string
    titleInBody?: boolean
    rowStyle?: string
    rowClass?: string
    boxStyle?: string
    boxClass?: string
    imageClass?: string
    imageBoxStyle?: string
    imageBoxClass?: string
    imageCol?: number
}>()

const store = useCartStore()
const cart = store.cart
const qty = ref(1)
const loading = ref(false)
const isModalOpen = ref(false)
const errors = ref(new FormErrors())

const shortDescription = computed(() => props.stockDescription || '')
const hasThumbnail = computed(() => props.thumbnail !== '')
const total = computed(() => {
    const p = Number(props.price) || 0
    const q = Number(qty.value) || 0
    return new Big(p).mul(q).toFixed(2)
})

const showModal = () => {
    if (props.allowPopup !== false) {
        isModalOpen.value = true
    }
}

const closeModal = () => {
    isModalOpen.value = false
}

const buy = () => {
    const q = Number(qty.value)
    if (isNaN(q)) {
        errors.value.record({ qty: ['Not a number'] })
    } else if (q <= 0) {
        errors.value.record({ qty: ['Purchase qty must be positive!'] })
    } else {
        const item = new StockItemModel()
        item.stockGuid = props.stockGuid || ''
        item.name = props.stockName || ''
        item.value = Big(props.price || 0)
        item.weight = Number(props.weight) || 0
        item.Qty = q

        cart.addItem('stockItem', String(item.stockGuid), item)
        push.success(`${q} ${props.stockName} added to cart`)
        closeModal()
    }
}
</script>

<template>
  <div class="w-full">
    <div :class="['flex flex-wrap md:flex-nowrap items-center border rounded-lg bg-white shadow-sm overflow-hidden mb-2', rowClass]" :style="rowStyle">
      <!-- Images -->
      <div
        v-if="hasThumbnail"
        class="w-full md:w-1/6 flex items-center justify-center p-2 cursor-pointer"
        :style="`min-height: ${minHeight}px;`"
        @click="showModal"
      >
        <div :class="['w-full h-full flex items-center justify-center', imageBoxClass]" :style="imageBoxStyle">
          <img :class="['max-h-full max-w-full object-contain', imageClass]" :src="thumbnail" alt="stock thumbnail" />
        </div>
      </div>

      <!-- Description -->
      <div
        :class="['flex-grow p-4 cursor-pointer', hasThumbnail ? 'w-full md:w-2/3' : 'w-full md:w-5/6']"
        @click="showModal"
      >
        <div :class="[boxClass]" :style="boxStyle">
          <h5 class="text-lg font-bold text-gray-900">
            {{ stockName }}<span v-if="showPlu" class="text-gray-500 font-normal"> ({{ stockPlu }})</span>
          </h5>
          <div class="text-sm text-gray-600 mt-1" v-html="shortDescription"></div>
        </div>
      </div>

      <!-- Buy Buttons -->
      <div class="w-full md:w-1/4 lg:w-1/6 p-4">
        <div v-if="showPrice || showBuyButton" :class="[boxClass]" :style="boxStyle">
          <div v-if="showPrice" class="mb-2">
            <span class="text-lg font-bold text-gray-900">${{ price }}</span>
            <slot name="list-price-label"><sub class="text-xs text-gray-500 ml-1">(inc)</sub></slot>
          </div>
          <div v-if="showBuyButton" class="flex rounded-md shadow-sm">
            <input
              type="text"
              class="block w-full rounded-l-md border-gray-300 text-right text-sm focus:border-indigo-500 focus:ring-indigo-500"
              :class="{ 'border-red-500': errors.has('qty') }"
              v-model="qty"
              autocomplete="off"
            />
            <button
              type="button"
              class="inline-flex items-center px-3 py-2 border border-l-0 border-transparent text-sm font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-400"
              :disabled="Number(qty) <= 0"
              @click="buy"
            >
              Buy
            </button>
          </div>
          <p v-if="errors.has('qty')" class="mt-1 text-xs text-red-600">{{ errors.get('qty') }}</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <slot name="modal-header">
          <div
            v-if="images.length > 0"
            class="relative rounded-t-lg overflow-hidden bg-center bg-no-repeat bg-cover"
            :style="{ height: `${headerImageHeight}px`, backgroundImage: `url(${images[0]})` }"
          >
            <div class="absolute inset-0 bg-black/20 p-4 flex flex-col justify-between">
              <div class="flex justify-end">
                <button type="button" class="bg-white/80 hover:bg-white rounded-full p-1 text-gray-600 shadow-sm" @click="closeModal">
                  <vue-feather type="x" size="1.2em"></vue-feather>
                </button>
              </div>
              <h5 v-if="!titleInBody" class="text-xl font-bold text-white drop-shadow-md">
                {{ stockName }}<span v-if="showPlu" class="font-normal opacity-80"> {{ stockPlu }}</span>
              </h5>
            </div>
          </div>
          <div v-else class="px-4 py-3 border-b flex justify-between items-center rounded-t-lg" :class="headerClass" :style="headerStyle">
            <h5 class="text-lg font-bold text-gray-900">
              {{ stockName }}<span v-if="showPlu" class="text-gray-500 font-normal"> {{ stockPlu }}</span>
            </h5>
            <button type="button" class="text-gray-400 hover:text-red-500" @click="closeModal">
              <vue-feather type="x" size="1.2em"></vue-feather>
            </button>
          </div>
        </slot>

        <div class="p-4">
          <slot name="modal-body-content">
            <h5 v-if="titleInBody && images.length > 0" class="text-xl font-bold text-gray-900 mb-2">
              {{ stockName }}<span v-if="showPlu" class="text-gray-500 font-normal"> {{ stockPlu }}</span>
            </h5>
            <div class="text-gray-700" v-html="stockDescription"></div>
          </slot>
        </div>

        <div class="px-4 py-3 border-t bg-gray-50 rounded-b-lg">
          <div v-if="!loading" class="flex items-center justify-between gap-4">
            <div class="flex-grow text-right">
              <span v-if="showPrice" class="text-lg font-bold text-gray-900">
                ${{ total }}
                <slot name="modal-price-label"><sub class="text-xs text-gray-500 ml-1">(total)</sub></slot>
              </span>
            </div>
            <div v-if="showBuyButton" class="w-48">
              <div class="flex rounded-md shadow-sm">
                <input
                  type="text"
                  class="block w-full rounded-l-md border-gray-300 text-right text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  :class="{ 'border-red-500': errors.has('qty') }"
                  v-model="qty"
                  autocomplete="off"
                />
                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-l-0 border-transparent text-sm font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-400"
                  :disabled="Number(qty) <= 0"
                  @click="buy"
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
          <div v-else class="flex justify-center p-2">
            <vue-feather type="loader" animation="spin" animation-speed="fast" size="1.2em"></vue-feather>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
