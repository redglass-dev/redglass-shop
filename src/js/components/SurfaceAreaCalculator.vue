<template>
  <div class="p-1 max-w-full">
    <div class="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div class="border-b bg-gray-50/50 px-2 py-1 text-sm font-medium">Requested Coverage</div>
      <div class="p-2 space-y-2">
        <div v-if="stock.unitType.hasWastage" class="text-xs text-gray-500 text-right">
          {{ stock.unitType ? stock.unitType.wastageTitle : 'Wastage' }}
        </div>

        <div class="grid grid-cols-12 gap-2">
          <div
            class="col-span-12"
            :class="{
              'lg:col-span-5': stock.unitType.hasWastage,
              'lg:col-span-6': !stock.unitType.hasWastage
            }"
          >
            <div class="relative flex items-stretch w-full">
              <input
                type="text"
                class="block w-full rounded-l-md border-gray-300 text-right text-sm focus:border-indigo-500 focus:ring-indigo-500"
                pattern="[0-9]*"
                autocomplete="off"
                v-model="lengthCoverageQty"
              />
              <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-xs">
                Length (m)
              </span>
            </div>
          </div>

          <div
            class="col-span-12"
            :class="{
              'lg:col-span-5': stock.unitType.hasWastage,
              'lg:col-span-6': !stock.unitType.hasWastage
            }"
          >
            <div class="relative flex items-stretch w-full">
              <input
                type="text"
                class="block w-full rounded-l-md border-gray-300 text-right text-sm focus:border-indigo-500 focus:ring-indigo-500"
                pattern="[0-9]*"
                autocomplete="off"
                v-model="widthCoverageQty"
              />
              <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-xs">
                Width (m)
              </span>
            </div>
          </div>

          <div v-if="stock.unitType?.hasWastage" class="col-span-12 lg:col-span-2">
            <div class="relative flex items-stretch w-full">
              <input
                type="text"
                class="block w-full rounded-l-md border-gray-300 text-right text-sm focus:border-indigo-500 focus:ring-indigo-500"
                pattern="[0-9]*"
                autocomplete="off"
                v-model="wastagePercentage"
              />
              <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-xs">
                %
              </span>
            </div>
          </div>
        </div>

        <div class="pt-1">
          <div class="relative flex items-stretch w-full">
            <input
              type="text"
              class="block w-full rounded-l-md border-gray-300 text-right text-sm focus:border-indigo-500 focus:ring-indigo-500"
              pattern="[0-9]*"
              autocomplete="off"
              v-model="surfaceAreaQty"
            />
            <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-xs">
              Area (m<sup>2</sup>)
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="stock.boxesPerPallet > 0" class="grid grid-cols-12 gap-2 mt-2">
      <div class="col-span-12 lg:col-span-6">
        <div class="relative flex items-stretch w-full">
          <input
            type="text"
            class="block w-full rounded-l-md border-gray-300 text-right text-sm focus:border-indigo-500 focus:ring-indigo-500"
            pattern="[0-9]*"
            autocomplete="off"
            v-model="pallets"
          />
          <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-xs">
            {{ stock.unitType ? stock.unitType.palletName : 'Pallets' }}
          </span>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6">
        <div class="relative flex items-stretch w-full">
          <input
            type="text"
            class="block w-full rounded-l-md border-gray-300 text-right text-sm focus:border-indigo-500 focus:ring-indigo-500"
            pattern="[0-9]*"
            autocomplete="off"
            v-model="remainder"
          />
          <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-xs">
            {{ stock.unitType ? stock.unitType.name : 'Item' }}
          </span>
        </div>
      </div>
    </div>

    <div class="space-y-0.5 mt-2">
      <div v-if="stock.boxesPerPallet > 0" class="text-xs text-gray-500 text-right">
        {{ stock.boxesPerPallet }} {{ stock.unitType ? stock.unitType.name : 'Item' }}(s) /
        {{ stock.unitType ? stock.unitType.palletName : 'Pallets' }}
      </div>
      <div v-if="stock.qtyInBox > 0" class="text-xs text-gray-500 text-right">
        {{ stock.qtyInBox }} {{ stock.unitType ? stock.unitType.piecesName : 'Pieces' }} /
        {{ stock.unitType ? stock.unitType.name : 'Item' }}
      </div>
      <div v-if="stock.unitType.hasWastage" class="text-xs text-gray-500 text-right">
        Coverage: {{ surfaceAreaWithWastage }} <span>m<sup>2</sup></span>
      </div>
      <div v-if="stock.qtyInBox > 0" class="text-xs text-gray-500 text-right">
        Total {{ stock.unitType ? stock.unitType.piecesName : 'Pieces' }}:
        {{ qty * stock.qtyInBox }} {{ stock.unitType ? stock.unitType.piecesName : 'Pieces' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Big from 'big.js'

interface UnitType {
  hasWastage: boolean
  wastage: number
  wastageTitle: string
  palletName: string
  name: string
  piecesName: string
}

interface Stock {
  unitType: UnitType
  boxesPerPallet: number
  qtyInBox: number
  surfaceArea: number
}

const props = defineProps<{
  stock: Stock
  qty: number | string
}>()

const emit = defineEmits<{
  (e: 'qty-updated', qty: number): void
}>()

/**
 * Calculator properties
 */
const surfaceAreaQty = ref(0)
const lengthCoverageQty = ref(0)
const widthCoverageQty = ref(0)
const pallets = ref(0)

const wastagePercentage = computed({
  get: () => (props.stock.unitType.wastage * 100).toFixed(1),
  set: (value: any) => {
    if (value <= 0) {
      props.stock.unitType.wastage = 0
      updateQty(surfaceAreaQty.value)
      return
    }

    props.stock.unitType.wastage = value / 100
    updateQty(surfaceAreaQty.value)
  }
})

const wastageCalculated = computed(() => new Big(props.stock.unitType.wastage).add(1).toNumber())

const surfaceAreaWithWastage = computed(() => {
  return new Big(props.qty).mul(props.stock.surfaceArea).round(2, 2).toNumber()
})

const remainder = computed({
  get: () => Number(props.qty) % props.stock.boxesPerPallet,
  set: (val: any) => {
    if (val >= props.stock.boxesPerPallet) {
      emit('qty-updated', Number(val))
    } else {
      emit('qty-updated', Number(pallets.value) * Number(props.stock.boxesPerPallet) + Number(val))
    }
  }
})

watch(() => props.qty, (val) => {
  console.log('Qty: ' + val)
  pallets.value = Math.floor(Number(val) / props.stock.boxesPerPallet)
}, { immediate: true })

watch(pallets, (val) => {
  emit('qty-updated', (Number(val) * props.stock.boxesPerPallet) + Number(remainder.value))
})

watch(widthCoverageQty, (val) => {
  if (!lengthCoverageQty.value || lengthCoverageQty.value === 0 || !val) {
    return
  }
  surfaceAreaQty.value = Number(new Big(val).mul(lengthCoverageQty.value).round(2, 2))
})

watch(lengthCoverageQty, (val) => {
  if (!widthCoverageQty.value || widthCoverageQty.value === 0 || !val) {
    return
  }
  surfaceAreaQty.value = Number(new Big(val).mul(widthCoverageQty.value).round(2, 2))
})

watch(surfaceAreaQty, (val) => {
  updateQty(val)
})

const updateQty = (newQty: number) => {
  const qtyResult = Number(new Big(newQty).div(props.stock.surfaceArea).mul(wastageCalculated.value).round(0, 3))
  emit('qty-updated', qtyResult)
}
</script>
