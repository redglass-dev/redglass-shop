<script setup lang="ts">
import { ref, watch, onMounted, useSlots, computed } from 'vue'
import uuid from 'uuid-random'
import Customer from '../models/contacts/Customer'
import { useCartStore } from '../stores/CartStore'
import axios from 'axios'
import AddressInput from './libraries/jl-general/controls/AddressInput.vue'

const props = defineProps<{
  allowEdit?: boolean
  hidePrices?: boolean
  validate?: boolean
  validatorUrl?: string
  continueUrl?: string
  showFreightProviders?: boolean
  shippingOptionsTitle?: string
  freightListTitle?: string
  showAddress?: boolean
  showCouponInput?: boolean
  onProviderChanged?: (cart: any) => void
}>()

const emit = defineEmits<{
  (e: 'cart-validated', cart: any): void
}>()

const store = useCartStore()
const cart = store.cart
const freightWarning = ref(false)
const controlId = ref(uuid())
const slots = useSlots()

const decrementQty = (key: string, item: any) => {
  if (item.Qty > 1) {
    cart.incrementQty('menuItem', key, -1)
  }
}

const validateShoppingCart = () => {
  const shippingData = cart.getShippingData()
  cart.validate(props.validatorUrl || '/api/v1/validate-cart', shippingData).then(() => {
    emit('cart-validated', cart)
    window.dispatchEvent(new CustomEvent('cart-validated', { detail: cart }))
  })
}

const updateUsersAddress = () => {
  let addressChanged = false
  const customerData = (window as any).Laravel?.customer
  if (customerData) {
    const user = new Customer(customerData)
    const deliveryAddress = user.getAddress()
    if (
      cart.shippingData.City !== deliveryAddress.city ||
      cart.shippingData.State !== deliveryAddress.state ||
      cart.shippingData.Postcode !== deliveryAddress.postcode
    ) {
      cart.shippingData.City = deliveryAddress.city
      cart.shippingData.State = deliveryAddress.state
      cart.shippingData.Postcode = deliveryAddress.postcode
      addressChanged = true
    }
  }
  return addressChanged
}

const updateAddress = (e: { city: string; postcode: string }) => {
  cart.shippingData.City = e.city
  cart.shippingData.Postcode = e.postcode
  validateShoppingCart()
}

const provider = computed(() => cart.getProvider())

watch(
  () => cart.freightProviderGuid,
  () => {
    const currentProvider = cart.getProvider()
    if (currentProvider && !currentProvider.isPickup && (window as any).Laravel?.customer) {
      updateUsersAddress()
    }

    if (props.onProviderChanged) {
      props.onProviderChanged(cart)
    }

    validateShoppingCart()
  }
)

onMounted(() => {
  console.log('Mounting shopping cart list!')
  if (props.validate || updateUsersAddress()) {
    validateShoppingCart()
  }
})

const continueButtonClass = computed(() => {
  return `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
    cart.hasItems() ? '' : 'opacity-50 cursor-not-allowed'
  }`
})

// Helper to check for slot existence
const hasSlot = (name: string) => !!slots[name]
</script>

<template>
  <div class="w-full">
    <div v-if="cart.count > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200" id="cartTable">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Qty</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
            <th v-if="!hidePrices" scope="col" class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th v-if="allowEdit" scope="col" class="px-3 py-2 relative w-10">
              <span class="sr-only">Delete</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Invoices -->
          <tr v-for="(item, key) in cart.invoices" :key="key" class="hover:bg-gray-50">
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
              <a :href="'/account/invoices/' + key" class="text-indigo-600 hover:text-indigo-900">Inv</a>
            </td>
            <td class="px-3 py-2 text-sm text-gray-900">{{ item.memo }}</td>
            <td v-if="!hidePrices" class="px-3 py-2 text-sm text-gray-900 text-right">${{ item.calTotal().toFixed(2) }}</td>
            <td v-if="allowEdit" class="px-3 py-2 text-right">
              <button type="button" class="text-red-400 hover:text-red-600" @click="cart.removeItem('invoice', key)">
                <vue-feather type="trash-2" size="1.2em"></vue-feather>
              </button>
            </td>
          </tr>

          <!-- Menu Items -->
          <tr v-for="(item, key) in cart.menuitems" :key="key" class="hover:bg-gray-50">
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
              <div v-if="allowEdit" class="flex items-center space-x-1">
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  :disabled="item.Qty < 2"
                  @click="decrementQty(key, item)"
                >
                  <vue-feather type="minus-circle" size="1.2em"></vue-feather>
                </button>
                <span class="w-6 text-center">{{ item.Qty }}</span>
                <button type="button" class="text-gray-400 hover:text-gray-600" @click="cart.incrementQty('menuItem', key, 1)">
                  <vue-feather type="plus-circle" size="1.2em"></vue-feather>
                </button>
              </div>
              <span v-else>{{ item.Qty }}</span>
            </td>
            <td class="px-3 py-2 text-sm text-gray-900">
              <div class="font-medium text-gray-900">{{ item.name }}</div>
              <div v-if="item.profiles.length > 0" class="mt-1 text-xs text-gray-500 space-y-0.5 ml-2">
                <template v-for="(profile, pKey) in item.profiles" :key="pKey">
                  <template v-if="profile.max === 1 && profile.min === 1">
                    <template v-for="(cond, cKey) in profile.condiments" :key="cKey">
                      <div v-if="cond.guid === profile.selected">
                        • {{ cond.name }}
                        <span v-if="cond.stockGuid && Number(cond.price) > 0" class="text-gray-400">(${{ cond.price }})</span>
                      </div>
                    </template>
                  </template>
                  <template v-else>
                    <template v-for="(cond, cKey) in profile.condiments" :key="cKey">
                      <div v-if="cond.selected">
                        • {{ cond.name }}
                        <span v-if="cond.stockGuid && Number(cond.price) > 0" class="text-gray-400">(${{ cond.price }})</span>
                      </div>
                    </template>
                  </template>
                </template>
              </div>
            </td>
            <td class="px-3 py-2 text-sm text-gray-900 text-right">${{ item.calTotal().toFixed(2) }}</td>
            <td v-if="allowEdit" class="px-3 py-2 text-right">
              <button type="button" class="text-red-400 hover:text-red-600" @click="cart.removeItem('menuItem', key)">
                <vue-feather type="trash-2" size="1.2em"></vue-feather>
              </button>
            </td>
          </tr>

          <!-- General Items -->
          <tr v-for="(item, key) in cart.items" :key="key" class="hover:bg-gray-50">
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
              <input
                v-if="allowEdit"
                type="text"
                class="w-12 rounded-md border-gray-300 text-center text-sm focus:border-indigo-500 focus:ring-indigo-500 px-1 py-0.5"
                v-model="item.Qty"
                @input="cart.save()"
                pattern="[0-9]*"
                autocomplete="off"
              />
              <span v-else>{{ item.Qty }}</span>
            </td>
            <td class="px-3 py-2 text-sm text-gray-900">{{ item.name }}</td>
            <td v-if="!hidePrices" class="px-3 py-2 text-sm text-gray-900 text-right">${{ item.calTotal().toFixed(2) }}</td>
            <td v-if="allowEdit" class="px-3 py-2 text-right">
              <button type="button" class="text-red-400 hover:text-red-600" @click="cart.removeItem('stockItem', key)">
                <vue-feather type="trash-2" size="1.2em"></vue-feather>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="!hidePrices" class="bg-gray-50 divide-y divide-gray-200">
          <tr v-if="showFreightProviders">
            <td colspan="4" class="px-3 py-4">
              <h6 class="text-sm font-bold text-gray-900 mb-2">{{ shippingOptionsTitle }}</h6>
              <div v-if="!provider.isPickup && showAddress" class="mb-4">
                <address-input
                  v-if="!provider.isPickup && showAddress"
                  :show-street="false"
                  :show-state="false"
                  v-model:city="cart.shippingData.City"
                  v-model:state="cart.shippingData.State"
                  v-model:postcode="cart.shippingData.Postcode"
                  @address-updated="updateAddress"
                ></address-input>
              </div>
              <div class="space-y-2">
                <div v-for="fp in cart.freightProviders.filter((p) => p.showOnWeb)" :key="fp.guid" class="flex items-center">
                  <input
                    type="radio"
                    :name="'providerRadio_' + controlId"
                    :id="'rb_' + fp.guid"
                    :value="fp.guid"
                    v-model="cart.freightProviderGuid"
                    class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label :for="'rb_' + fp.guid" class="ml-2 block text-sm text-gray-700">
                    {{ fp.name }} - {{ fp.description }}
                  </label>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="!hasSlot('shipping-options-footer')">
            <td colspan="4" class="px-3 py-2">
              <slot name="shipping-options-footer"></slot>
            </td>
          </tr>

          <tr v-if="cart.freightList.length > 0">
            <th colspan="4" class="px-3 py-2 text-left text-sm font-bold text-gray-900 bg-gray-100">
              <slot name="freight-list-heading">{{ freightListTitle }}</slot>
            </th>
          </tr>

          <tr v-for="(item, key) in cart.freightList" :key="key" class="bg-gray-50">
            <td class="px-3 py-2 text-sm text-gray-900">{{ item.qty }}</td>
            <td class="px-3 py-2 text-sm text-gray-900">{{ item.name }}</td>
            <td v-if="!hidePrices" class="px-3 py-2 text-sm text-gray-900 text-right">${{ item.calTotal().toFixed(2) }}</td>
            <td v-if="allowEdit" class="px-3 py-2"></td>
          </tr>

          <tr v-if="freightWarning">
            <th colspan="4" class="px-3 py-2 text-center text-sm text-gray-500 italic">
              Login to see freight charges.
            </th>
          </tr>
          <tr v-else-if="hasSlot('freight-list-footer')">
            <td colspan="4" class="px-3 py-2">
              <slot name="freight-list-footer"></slot>
            </td>
          </tr>

          <tr class="bg-gray-100 font-bold">
            <th colspan="2" class="px-3 py-3 text-right text-sm text-gray-900 uppercase">Total:</th>
            <th class="px-3 py-3 text-right text-base text-gray-900">${{ cart.totalWithFreight.toFixed(2) }}</th>
            <td v-if="allowEdit" class="px-3 py-3"></td>
          </tr>

          <tr v-if="showCouponInput">
            <td colspan="4" class="px-3 py-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <div class="flex items-stretch gap-2">
                <input
                  type="text"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  v-model="cart.couponString"
                  @change="validateShoppingCart"
                  placeholder="Coupon Code"
                />
                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  @click="validateShoppingCart"
                >
                  Apply
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="hasSlot('cart-footer')">
            <td colspan="4" class="px-3 py-2">
              <slot name="cart-footer"></slot>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div v-else class="py-8 text-center text-gray-500">
      <h5 class="text-lg font-medium">Your Cart is Empty!</h5>
    </div>

    <div v-if="continueUrl" class="mt-6 flex justify-end">
      <a :class="continueButtonClass" id="continue" :href="continueUrl">Continue</a>
    </div>
  </div>
</template>

<style scoped>
/* No longer needed with Tailwind classes */
</style>
