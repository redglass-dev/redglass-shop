<template>
  <div v-if="shown" id="popper" ref="popper" class="z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm">
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div class="overflow-hidden rounded-lg">
        <div v-if="$slots.header" class="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-900">
          <slot name="header"></slot>
        </div>

        <div class="px-3 py-2 text-sm text-gray-700">
          <slot name="body"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { createPopper } from '@popperjs/core'

const popper = ref<HTMLElement | null>(null)

const props = defineProps<{
  show?: boolean
  parent?: string
}>()

const shown = computed(() => {
  if (props.show && props.parent) {
    nextTick(() => {
      const parentElement = document.getElementById(props.parent!)
      if (parentElement && popper.value) {
        console.log(props.parent, popper.value)
        createPopper(parentElement, popper.value, {
          placement: 'bottom',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ],
        })
      }
    })
  }

  return props.show
})
</script>
