<template>
  <div class="flex items-center justify-between w-full p-1">
    <div class="text-sm font-medium text-gray-700">
      {{ group.name }}:
    </div>
    <div class="flex flex-wrap justify-end gap-2">
      <div v-if="!useRadioButtons" class="inline-flex rounded-md shadow-sm" role="group">
        <button
          v-for="(item, i) in group.items"
          :key="i"
          type="button"
          class="px-3 py-1 text-xs font-medium border first:rounded-l-md last:rounded-r-md transition-colors"
          :class="[
            selected === item
              ? 'bg-indigo-600 text-white border-indigo-600 z-10'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
          @click="selectionChanged(item)"
        >
          {{ item }}
        </button>
      </div>
      <div v-else class="flex flex-wrap items-center gap-4">
        <div v-for="(item, i) in group.items" :key="i" class="flex items-center">
          <input
            type="radio"
            :id="`${optionId}_${i}`"
            :name="optionId"
            :value="item"
            class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            :checked="selected === item"
            @change="selectionChanged(item)"
          />
          <label :for="`${optionId}_${i}`" class="ml-2 text-sm text-gray-700 cursor-pointer">
            {{ item }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import uuid from 'uuid-random'

const props = defineProps<{
  group: {
    name: string
    items: string[]
  }
  btnClass?: string
  selected: string
  useRadioButtons?: boolean
}>()

const emit = defineEmits<{
  (e: 'selection-changed', payload: { group: any; selected: string }): void
}>()

const localSelected = ref('')
const optionId = ref(uuid())

onMounted(() => {
  localSelected.value = props.selected
})

watch(
  () => props.selected,
  (val) => {
    localSelected.value = val
  }
)

const selectionChanged = (item: string) => {
  localSelected.value = item
  emit('selection-changed', { group: props.group, selected: item })
}
</script>
