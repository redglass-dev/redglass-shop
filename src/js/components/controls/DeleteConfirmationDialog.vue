<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <Transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div v-if="isOpen" class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <form @submit.prevent="runDelete">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <vue-feather type="alert-triangle" class="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                        {{ titleText }}
                      </h3>
                      <button type="button" class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none" @click="close">
                        <span class="sr-only">Close</span>
                        <vue-feather type="x" size="1.25em" />
                      </button>
                    </div>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        {{ messageText }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                <button
                  ref="deleteButton"
                  type="submit"
                  class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm items-center"
                  :disabled="isDeleting"
                >
                  <vue-feather v-if="isDeleting" type="loader" animation="spin" animation-speed="fast" size="1.0em" class="mr-2" />
                  Delete
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  @click="hide"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    isDeleting?: boolean
    title?: string
    message?: string
  }>(),
  {
    isDeleting: false,
    title: 'Delete Detail',
    message: 'Are you sure you want to delete this item?'
  }
)

const emit = defineEmits<{
  (e: 'confirm-delete', item: any): void
}>()

const isOpen = ref(false)
const itemToDelete = ref<any>(null)
const titleValue = ref<string | null>(null)
const messageValue = ref<string | null>(null)
const deleteButton = ref<HTMLButtonElement | null>(null)

const titleText = computed(() => titleValue.value || props.title)
const messageText = computed(() => messageValue.value || props.message)

const runDelete = () => {
  console.log('Confirm delete!')
  emit('confirm-delete', itemToDelete.value)
}

const show = (item: any, title?: string, message?: string) => {
  itemToDelete.value = item
  titleValue.value = title || null
  messageValue.value = message || null
  isOpen.value = true

  console.log('Focusing delete button')
  nextTick(() => {
    deleteButton.value?.focus()
  })
}

const hide = () => {
  isOpen.value = false
}

const close = () => {
  hide()
}

defineExpose({
  show,
  hide,
  close
})
</script>
