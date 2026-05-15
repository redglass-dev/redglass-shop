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
      :show-more-info-button="showMoreInfo"
    >
      <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope || {}" />
      </template>
    </stock-list-item-control>
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
    showMoreInfo?: boolean
}>()

const localStock = ref(new Stock())
const loading = ref(false)

const loadStock = (stock: any) => {
  localStock.value = new Stock(stock)
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
    //console.log('showStock', `/products/${localStock.value.pluSlug}`)
   window.location.href = `/products/${localStock.value.pluSlug}`
}

defineExpose({
  showStock
})
</script>
