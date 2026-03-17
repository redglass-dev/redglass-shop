<template>
  <div class="px-3 lg:px-0 space-y-2">
    <div v-for="group in characteristicGroups" :key="group.guid" class="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div
        class="px-3 py-2 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        @click="expanded[group.guid] = !expanded[group.guid]"
        :class="filterGroupHeaderClass"
      >
        <span class="text-sm font-semibold text-gray-900">{{ group.name }}</span>
        <vue-feather
          :type="expanded[group.guid] ? 'chevron-down' : 'chevron-right'"
          size="1rem"
          class="text-gray-500"
        ></vue-feather>
      </div>

      <div v-show="expanded[group.guid]" class="p-2 space-y-1">
        <div v-for="item in group.characteristics" :key="item.guid" class="flex items-center">
          <input
            type="checkbox"
            :id="item.guid"
            class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            @change="toggleCharacteristic(item.guid)"
          />
          <label :for="item.guid" class="ml-2 text-sm text-gray-700 truncate cursor-pointer">
            {{ item.name }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'

const emit = defineEmits<{
  (e: 'no-characteristic-groups'): void
  (e: 'filter-changed', filter: string): void
}>()

const props = defineProps<{
  filterGroupHeaderClass?: string
  filter?: string
}>()

const characteristicGroups = ref<any[]>([])
const selectedCharacteristics = ref<string[]>([])
const expanded = ref<Record<string, boolean>>({})

onMounted(async () => {
  let filterString = ''
  if (props.filter) {
    filterString = `?f=${props.filter}`
  }

  try {
    const response = await axios.get(`/api/v1/public/stocks/characteristic-groups${filterString}`)
    const data = response.data

    const expandMap: Record<string, boolean> = {}
    data.forEach((group: any, index: number) => {
      expandMap[group.guid] = index === 0
    })

    expanded.value = expandMap
    characteristicGroups.value = data

    if (characteristicGroups.value.length === 0) {
      emit('no-characteristic-groups')
    }
  } catch (error) {
    console.error('Failed to load characteristic groups', error)
  }
})

const toggleCharacteristic = (id: string) => {
  const index = selectedCharacteristics.value.indexOf(id)
  if (index < 0) {
    selectedCharacteristics.value.push(id)
  } else {
    selectedCharacteristics.value.splice(index, 1)
  }
  updateFilter()
}

const updateFilter = () => {
  const filter = selectedCharacteristics.value.length > 0
    ? `stockCharacteristicGuid|acc_stocks_stock_characteristics|guid|stockGuid|join:${selectedCharacteristics.value.join('|')}`
    : ''
  emit('filter-changed', filter)
}
</script>
