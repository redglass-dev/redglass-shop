<template>
  <div class="w-full relative z-10">
    <div :id="'carousel' + name" class="relative overflow-hidden" style="z-index: 5">
      <div class="flex transition-transform duration-500 ease-in-out" :style="{ transform: `translateX(-${activeIndex * 100}%)` }">
        <div v-for="(group, index) in stockItemsGrouped" :key="index" class="w-full flex-shrink-0">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            <div v-for="(stock, i) in group.items" :key="'st_' + i" class="h-full">
              <stock-list-item-control
                v-if="stock !== null"
                :show-unit-type="showUnitType"
                :image-box-class="imageBoxClass"
                :href="'/stocks/' + stock.plu"
                class="bg-white rounded-lg shadow h-full"
                :stock="stock"
                @more-info="showStockModal(stock)"
                :btn-class="btnClass"
                :info-btn-class="infoBtnClass"
              ></stock-list-item-control>
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="stockItemsGrouped.length > 1"
        class="absolute left-0 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full shadow-md z-20"
        @click="prevSlide"
      >
        <vue-feather type="chevron-left" class="text-gray-600"></vue-feather>
      </button>
      <button
        v-if="stockItemsGrouped.length > 1"
        class="absolute right-0 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full shadow-md z-20"
        @click="nextSlide"
      >
        <vue-feather type="chevron-right" class="text-gray-600"></vue-feather>
      </button>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full relative">
        <button
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10 bg-white/80 rounded-full p-1 shadow-sm"
          @click="closeModal"
        >
          <vue-feather type="x" size="1.5em"></vue-feather>
        </button>
        <div class="p-0">
          <slot name="modal-body-content">
            <stock-view-control
              ref="stockViewControl"
              :stock="modalStockItem"
              :slide-interval="slideInterval"
              :btn-class="btnClass"
              @added-to-cart="closeModal"
              :show-unit-type="showUnitType"
            >
              <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope || {}" />
              </template>
            </stock-view-control>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted} from 'vue'
import axios from 'axios'
import Stock from '../models/stock/Stock'
import StockViewControl from './StockViewControl.vue'
import StockListItemControl from './StockListItemControl.vue'

const props = defineProps<{
  name?: string
  itemsOnPage?: number
  stockGroups?: any[]
  stockPlus?: any[]
  useSpecials?: boolean
  slideInterval?: string | number
  imageBoxClass?: string | string[] | Record<string, any>
  btnClass?: string
  infoBtnClass?: string
  returnUrl?: string
  showUnitType?: boolean
}>()

const activeIndex = ref(0)
const stockItemsGrouped = ref<any[]>([])
const loading = ref(false)
const modalStockItem = ref(new Stock())
const isModalOpen = ref(false)
let autoSlideInterval: any = null

const nextSlide = () => {
  if (stockItemsGrouped.value.length === 0) return
  activeIndex.value = (activeIndex.value + 1) % stockItemsGrouped.value.length
}

const prevSlide = () => {
  if (stockItemsGrouped.value.length === 0) return
  activeIndex.value = (activeIndex.value - 1 + stockItemsGrouped.value.length) % stockItemsGrouped.value.length
}

const loadStockItems = (items: any[]) => {
  const itemsPerPage = props.itemsOnPage || 1
  const groups = []
  let currentGroup = { items: [] as any[] }

  items.forEach((item, index) => {
    if (index % itemsPerPage === 0 && index !== 0) {
      groups.push(currentGroup)
      currentGroup = { items: [] }
    }
    currentGroup.items.push(new Stock(item))
  })

  if (currentGroup.items.length > 0) {
    // Fill the last group if needed
    while (currentGroup.items.length < itemsPerPage) {
      if (items.length > itemsPerPage) {
        currentGroup.items.push(new Stock(items[currentGroup.items.length % items.length]))
      } else {
        currentGroup.items.push(null)
      }
    }
    groups.push(currentGroup)
  }

  stockItemsGrouped.value = groups
}

onMounted(async () => {
  loading.value = true
  try {
    let response: any
    if (props.useSpecials) {
      response = await axios.get('/api/v1/public/stocks/on-special')
    } else if (props.stockGroups && props.stockGroups.length > 0) {
      response = await axios.get(`/api/v1/public/stocks/by-stock-groups/${props.stockGroups.join(',')}`)
    } else if (props.stockPlus && props.stockPlus.length > 0) {
      response = await axios.get(`/api/v1/public/stocks/by-stocks/${props.stockPlus.join(',')}`)
    }

    if (response) {
      loadStockItems(response.data)
    }
  } catch (error) {
    console.error('Failed to load stock items for carousel', error)
  } finally {
    loading.value = false
  }

  const interval = Number(props.slideInterval) || 5000
  if (interval > 0) {
    autoSlideInterval = setInterval(nextSlide, interval)
  }
})

onUnmounted(() => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval)
  }
})

const showStockModal = (item: any) => {
  modalStockItem.value = item
  isModalOpen.value = true
  history.replaceState({ modal: true }, '', `/stocks/${item.plu}`)
}

const closeModal = () => {
  isModalOpen.value = false
  history.replaceState({ modal: false }, '', props.returnUrl || '/')
}
</script>

<style scoped>
.chevron {
    color: gray;
    opacity: 0.5;
}
</style>
