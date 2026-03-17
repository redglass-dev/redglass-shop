<template>
  <div class="space-y-1">
    <div v-if="validatedValue === ''" class="flex flex-wrap items-end gap-2">
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
        <input
          type="text"
          name="Coupon Code"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          v-model="inputValue"
        />
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="addCoupon"
      >
        Add
      </button>
      <p v-if="errorMessage !== ''" class="mt-1 text-sm text-red-600 w-full">{{ errorMessage }}</p>
    </div>
    <div v-else class="flex flex-wrap items-end gap-2">
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
        <input
          type="text"
          name="Coupon Code"
          class="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :placeholder="validatedValue"
          disabled
        />
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        @click="clearCoupon"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  value?: string
  errors?: string
}>()

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

const inputValue = ref('')
const validatedValue = ref('')
const errorMessage = ref('')

onMounted(() => {
  errorMessage.value = props.errors || ''
  inputValue.value = props.value || ''
  validatedValue.value = props.value || ''
})

const validateCoupon = (value: string): boolean => {
  return value !== ''
}

const emitCouponChanged = () => {
  emit('change', validatedValue.value)
}

const localValueChanged = (value: string) => {
  if (validateCoupon(value)) {
    console.log('coupon code updated!')
    validatedValue.value = value
    errorMessage.value = ''
    emitCouponChanged()
  } else {
    errorMessage.value = 'This coupon is invalid or already redeemed!'
  }
}

const addCoupon = () => {
  localValueChanged(inputValue.value)
}

const clearCoupon = () => {
  console.log('Clearing coupon.')
  validatedValue.value = ''
  inputValue.value = ''
  emitCouponChanged()
}
</script>
