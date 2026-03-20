<template>
  <div class="w-full h-full relative z-10">
    <stock-list-item-control
      v-if="!loading && !hideInList"
      :stock="localStock"
      @more-info="showStock"
      :btn-class="btnClass"
      :image-box-class="imageBoxClass"
      :info-btn-class="infoBtnClass"
      :show-buy-buttons="showBuyButtons"
      :show-prices="showPrices"
      :show-unit-type="showUnitType"
    >
      <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope || {}" />
      </template>
    </stock-list-item-control>

<!--    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">-->
<!--      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full relative">-->
<!--        <button-->
<!--          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10 bg-white/80 rounded-full p-1 shadow-sm"-->
<!--          @click="closeModal"-->
<!--        >-->
<!--          <vue-feather type="x" size="1.5em"></vue-feather>-->
<!--        </button>-->
<!--        <div class="p-0">-->
<!--          <slot name="modal-body-content">-->
<!--            <stock-view-control-->
<!--              ref="stockViewControl"-->
<!--              :stock="localStock"-->
<!--              :slide-interval="slideInterval"-->
<!--              :btn-class="btnClass"-->
<!--              @added-to-cart="closeModal"-->
<!--              :show-buy-buttons="showBuyButtons"-->
<!--              :show-unit-type="showUnitType"-->
<!--              :show-prices="showPrices"-->
<!--            >-->
<!--              <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">-->
<!--                <slot :name="slot" v-bind="scope || {}" />-->
<!--              </template>-->
<!--            </stock-view-control>-->
<!--          </slot>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'
import Stock from '../models/stock/Stock'
import StockViewControl from './StockViewControl.vue'
import StockListItemControl from './StockListItemControl.vue'

const props = defineProps<{
  imageBoxClass?: string | string[] | Record<string, any>
  stockGuid?: string
  slideInterval?: string | number
  btnClass?: string
  infoBtnClass?: string
  stock?: any
  showBuyButtons?: boolean
  showPrices?: boolean
  hideInList?: boolean
  returnUrl?: string
  showOnLoad?: boolean
  jumpToPage?: boolean
  showUnitType?: boolean
}>()

const localStock = ref(new Stock())
const loading = ref(false)
const isModalOpen = ref(false)
const stockViewControl = ref<any>(null)

const loadStock = (stock: any) => {
  localStock.value = new Stock(stock)
    console.log('StockItemControl loadStock', localStock.value)
}

watch(
  () => props.stock,
  (val) => {
    if (val) loadStock(val)
  }
)

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
      if (props.showOnLoad) {
        showStock()
      }
    } catch (error) {
      console.error('Failed to load stock', error)
    } finally {
      loading.value = false
    }
  }
})

const showStock = () => {
  //if (props.jumpToPage) {
    window.location.href = `/products/${localStock.value.pluSlug}`
  //  return
 // }

  // stockViewControl.value?.update()
  // nextTick(() => {
  //   history.replaceState({ modal: true }, '', `/products/${localStock.value.plu}`)
  //   isModalOpen.value = true
  // })
}

const closeModal = () => {
  isModalOpen.value = false
  history.replaceState({ modal: false }, '', props.returnUrl || '/')
}

defineExpose({
  showStock
})
</script>

<!--<docs>-->

<!--A Basic stock item control.-->
<!--```-->
<!--<stock-item-control :stock="stockItem"></stock-item-control>-->
<!--```-->

<!--</docs>-->
