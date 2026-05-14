<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import flatPickr from 'vue-flatpickr-component'
import ConfirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate'
import 'flatpickr/dist/plugins/confirmDate/confirmDate.css'
import Form from '../Form'
import Formatter from '../models/general/Formatter'
import AddressInput from './controls/AddressInput.vue'
import FreightProvider from '../models/pos/FreightProvider'
import { useCartStore } from '../stores/CartStore'
import ShoppingCartList from './ShoppingCartList.vue'
import TextInput from "./controls/TextInput.vue";

const props = defineProps<{
    stripeKey: string
    allowOrder?: boolean
    showDeliveryDate?: boolean
    showPrices?: boolean
    allowCard?: boolean
    deliveryAddress?: any
    billingAddress?: any
    user?: any
    fax?: string
    allowPickup?: boolean
    preferPickup?: boolean
    pickupOnly?: boolean
    showAddressForPickup?: boolean
    requireZone?: boolean
    showCouponInput?: boolean
    recaptchaSiteKey?: string
}>()

const emit = defineEmits<{
    (e: 'cart-validated', cart: any): void
}>()

const store = useCartStore()
const cart = store.cart
const form = ref(new Form({}))
const date = ref(new Date())
const isPickup = ref(false)
const working = ref(false)
const allowPayment = ref(false)
const allowAddress = ref(true)
const invalidAddress = ref(false)
const shippingInfo = ref('')
const cartString = ref('')
const errorMessage = ref('')
const nameOnCard = ref('')
const showProcessingModal = ref(false)
const captureCompleted = ref(false)
const customer = ref((window as any).Laravel?.customer)
const fax = ref('')

const cardRef = ref<HTMLElement | null>(null)
const addressDetails = ref<any>(null)
const billingAddressDetails = ref<any>(null)

let stripe: any = null
let cardElement: any = null

const datePickerConfig = {
    weekNumbers: true,
    enableTime: true,
    dateFormat: 'Y-m-d H:i:S',
    altFormat: 'd/m/Y h:i K',
    altInput: true,
    plugins: [new (ConfirmDatePlugin as any)({ confirmText: 'Done', confirmIcon: '' })],
    position: 'auto center',
    minDate: new Date(new Date().getTime() - 60000),
    minuteIncrement: 15
}

const cartTotal = computed(() => store.cart.total.toFixed(2))
const provider = computed(() => new FreightProvider(store.cart.getProvider()))

const onProviderChanged = (e: any) => {
    const p = e.getProvider()
    if (p && !p.isPickup) {
        e.shippingData.City = form.value.deliveryCity
        e.shippingData.State = form.value.deliveryState
        e.shippingData.Postcode = form.value.deliveryPostcode
        updateZone({ city: e.shippingData.City, postcode: e.shippingData.Postcode })
    } else if (p) {
        updateZone({ city: p.pickupCity, postcode: p.pickupPostcode })
    }
    cartValidated(store.cart)
}

const clearErrors = (field: string = '') => {
    if (form.value.errors.any()) {
        if (field === '') {
            form.value.errors.clearAll()
        } else {
            form.value.errors.clear(field)
        }
        addressUpdated()
    }
}

const addressUpdated = () => {
    shippingInfo.value = ''
    nextTick(() => {
        validateCart()
    })
}

const updateZone = async (address: { city: string; postcode: string }) => {
    let found = false
    allowAddress.value = isPickup.value
    invalidAddress.value = false

    try {
        const response = await axios.get(`/api/v1/public/zones/${address.city}/${address.postcode}`)
        const zone = response.data.description
        if (zone !== undefined) {
            found = true
            if (zone !== '') {
                shippingInfo.value = zone
                allowAddress.value = true
            }
        }
        if (props.requireZone && !isPickup.value && !found) {
            allowAddress.value = false
        } else {
            allowAddress.value = true
        }
        return response
    } catch (error) {
        console.error('Zone lookup failed', error)
        allowAddress.value = isPickup.value
        return null
    }
}

const validateCart = (changed: string = 'none') => {
    working.value = true
    allowPayment.value = false

    let address = { city: '', postcode: '' }
    if (addressDetails.value) {
        const currentProvider = store.cart.getProvider()
        if (currentProvider?.isPickup) {
            const p = new FreightProvider(currentProvider)
            address = p.getAddress()
        } else {
            address = addressDetails.value.getAddress()
        }
    }

    if (isPickup.value) {
        invalidAddress.value = false
        store.cart
            .validate('/api/v1/validate-cart', {
                City: address.city,
                Postcode: address.postcode,
                Changed: changed,
                Pickup: isPickup.value
            })
            .then(() => {
                cartValidated(store.cart)
            })
        return
    }

    updateZone(address)
        .then((response) => {
            if (!allowAddress.value) {
                working.value = false
                return
            }
            store.cart
                .validate('/api/v1/validate-cart', {
                    City: address.city,
                    Postcode: address.postcode,
                    Changed: changed,
                    Pickup: isPickup.value
                })
                .then(() => {
                    cartValidated(store.cart)
                    emit('cart-validated', store.cart)
                })
        })
        .catch(() => {
            invalidAddress.value = !isPickup.value
            working.value = false
        })
}

const cartValidated = (cartObj: any) => {
    const cs = JSON.stringify(cartObj)
    if (cs == null || !cartObj.hasItems()) {
        cartString.value = ''
        working.value = false
        return
    }

    cartString.value = cs
    allowPayment.value = allowAddress.value

    form.value.errors.clear('Phone')
    if (!form.value.Phone || form.value.Phone.trim() === '') {
        allowPayment.value = false
        form.value.errors.add('Phone', 'A phone number is required!')
    }

    if (!form.value.Email || form.value.Email.trim() === '') {
        allowPayment.value = false
        form.value.errors.add('Email', 'A email is required!')
    }

    form.value.errors.clear('FirstName')
    if (!form.value.FirstName || form.value.FirstName.trim() === '') {
        allowPayment.value = false
        form.value.errors.add('FirstName', 'A first name is required!')
    }

    form.value.errors.clear('LastName')
    if (!form.value.LastName || form.value.LastName.trim() === '') {
        allowPayment.value = false
        form.value.errors.add('LastName', 'A last name is required!')
    }

    form.value.errors.clear('nameOnCard')
    if (props.allowCard && (!nameOnCard.value || nameOnCard.value.trim() === '')) {
        allowPayment.value = false
        form.value.errors.add('nameOnCard', 'Card name is required!')
    }

    working.value = false
}

const placeOrder = () => {
    if (!props.allowOrder) return

    form.value.addField('fax', props.fax || '')
    showProcessingModal.value = true
    errorMessage.value = ''

    cartString.value = JSON.stringify(store.cart)
    form.value.addField('cart', cartString.value)
    form.value.addField('Pickup', isPickup.value)

    if (props.showDeliveryDate || isPickup.value) {
        form.value.addField('RequiredDate', Formatter.formatDate(date.value))
    }

    let payload = Object.assign({ freightProviderGuid: provider.value.guid }, form.value)
    if (provider.value.isPickup) {
        payload = { ...payload, ...provider.value.getAddress(true) }
    }

    axios
        .post('/api/v1/process-order', payload)
        .then((response) => {
            if (response.status === 200 && response.data.status === 'success') {
                store.cart.clear()
                window.location.href = `/orderplaced/${response.data.salesOrderGuid}`
            } else {
                errorMessage.value = response.data.error || 'Failed to process order!'
            }
        })
        .catch((error) => {
            errorMessage.value = `Failed to process order!<br />${error.message}`
        })
}

const processPayment = async () => {
    if (!props.allowCard) return

    allowPayment.value = false
    if (!nameOnCard.value || nameOnCard.value.trim() === '') {
        form.value.errors.add('nameOnCard', 'Card name is required!')
        return
    }

    form.value.addField('fax', props.fax || '')
    showProcessingModal.value = true
    errorMessage.value = ''

    try {
        const results = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: nameOnCard.value.trim(),
                email: form.value.Email
            }
        })

        if (results.error) {
            errorMessage.value = results.error.message
            cartValidated(store.cart)
        } else if (!results.paymentMethod) {
            errorMessage.value = 'Payment method creation failed'
            cartValidated(store.cart)
        } else {
            cartString.value = JSON.stringify(store.cart)
            form.value.addField('paymentMethod', results.paymentMethod.id)
            form.value.addField('cart', cartString.value)
            form.value.addField('Pickup', isPickup.value)

            if (props.showDeliveryDate || isPickup.value) {
                form.value.addField('RequiredDate', Formatter.formatDateTime(date.value))
            }

            let payload = Object.assign({ freightProviderGuid: provider.value.guid }, form.value)
            if (provider.value.isPickup) {
                payload = { ...payload, ...provider.value.getAddress(true) }
            }

            const response = await axios.post('/api/v1/process-payment', payload)
            if (response.status === 200 && response.data.status === 'success') {
                store.cart.clear()
                window.location.href = `/invoiceplaced/${response.data.salesInvoiceGuid}`
            } else {
                errorMessage.value = response.data.error || 'Payment failed'
                form.value.errors.record(response.data)
            }
        }
    } catch (error: any) {
        errorMessage.value = `Payment process error!<br />${error.message}`
    }
}

const copyShippingAddress = () => {
    form.value.billingStreet = form.value.deliveryStreet
    form.value.billingCity = form.value.deliveryCity
    form.value.billingState = form.value.deliveryState
    form.value.billingPostcode = form.value.deliveryPostcode
    form.value.billingCountry = form.value.deliveryCountry
}

const closeProcessingModal = () => {
    showProcessingModal.value = false
    errorMessage.value = ''
    cartValidated(store.cart)
}

const loadAddress = (address: any) => {
    form.value = new Form(address)
    addressDetails.value?.setLocation(address.deliveryCity, address.deliveryPostcode, address.deliveryState)
    billingAddressDetails.value?.setLocation(address.billingCity, address.billingPostcode, address.billingState)
    form.value.addField('FirstName', props.user?.firstName || '')
    form.value.addField('LastName', props.user?.lastName || '')
    form.value.addField('Company', props.user?.company || '')
    form.value.addField('Email', props.user?.email || '')
    form.value.addField('Memo', '')
}

onMounted(() => {
    loadAddress({ ...props.deliveryAddress, ...props.billingAddress })
    validateCart()

    if (props.allowCard) {
        stripe = (window as any).Stripe(props.stripeKey)
        const elements = stripe.elements()
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }
            }
        })
        cardElement.mount(cardRef.value)
    }

    if (props.user) {
        nameOnCard.value = `${props.user.firstName || ''} ${props.user.lastName || ''}`.trim()
    }

    if (props.allowPickup) {
        if (props.pickupOnly) {
            isPickup.value = true
            addressUpdated()
        } else {
            isPickup.value = props.preferPickup || false
        }
    }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Left Column: Details -->
      <div class="space-y-8">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 border-b-2 border-indigo-600 pb-2 mb-6">
            {{ isPickup ? 'Details' : 'Shipping Details' }}
          </h3>

          <div class="space-y-4">
            <div v-if="shippingInfo !== ''" class="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700">
              {{ shippingInfo }}
            </div>

            <div v-if="!allowAddress && !invalidAddress" class="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
              We do not ship to this address.
            </div>

            <div v-if="invalidAddress" class="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 font-bold">
              Please enter a valid address for this order!
            </div>
          </div>

          <div v-if="allowPickup" class="mt-6 flex items-center">
            <input
              type="checkbox"
              id="Pickup"
              class="h-5 w-5 redglass-input"
              @change="addressUpdated"
              v-model="isPickup"
              :disabled="pickupOnly"
            />
            <label for="Pickup" class="ml-3 text-sm font-medium text-gray-700">Pickup</label>
          </div>

          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mt-8">
            <div v-if="showDeliveryDate || isPickup" class="sm:col-span-6">
              <label for="RequiredDate" class="redglass-input-label pb-1">
                {{ isPickup ? 'Pickup At' : 'Preferred Delivery Date' }}
              </label>
              <flat-pickr
                id="RequiredDate"
                ref="requiredDate"
                :config="datePickerConfig"
                class="block w-full redglass-input"
                :class="{ 'border-red-500': form.errors.has('RequiredDate') }"
                placeholder="Select date"
                v-model="date"
              />
              <p v-if="form.errors.has('RequiredDate')" class="mt-1 text-xs text-red-600">{{ form.errors.get('RequiredDate') }}</p>
            </div>

              <div class="sm:col-span-6">
                  <TextInput label="Email Address" type="email" v-model="form.Email" :error="form.errors.get('Email')" @change="clearErrors('Email')">
                      <a v-if="!customer" href="/login" class="text-xs font-semibold text-(--primary-color) hover:text-(--primary-color)/75">
                          Already have an account? Login
                      </a>
                  </TextInput>
              </div>

            <div class="sm:col-span-6">
                <TextInput label="Company" v-model="form.Company" :error="form.errors.get('Company')" @change="clearErrors('Company')" />
            </div>

            <div class="sm:col-span-3">
                <TextInput label="First Name" v-model="form.FirstName" :error="form.errors.get('FirstName')" @change="clearErrors('FirstName')" />
            </div>

            <div class="sm:col-span-3">
                <TextInput label="Last Name" v-model="form.LastName" :error="form.errors.get('LastName')" @change="clearErrors('LastName')" />
            </div>

            <div class="sm:col-span-6">
                <TextInput label="Phone" v-model="form.Phone" :error="form.errors.get('Phone')" @change="clearErrors('Phone')" />
            </div>
          </div>
        </div>

        <div v-show="!provider.isPickup" class="pt-8 border-t border-gray-200">
          <address-input
            v-if="!isPickup || showAddressForPickup"
            ref="addressDetails"
            v-model:street="form.deliveryStreet"
            street-input="deliveryStreet"
            v-model:city="form.deliveryCity"
            city-input="deliveryCity"
            v-model:state="form.deliveryState"
            state-input="deliveryState"
            v-model:postcode="form.deliveryPostcode"
            postcode-input="deliveryPostcode"
            :error-street="form.errors.get('deliveryStreet')"
            :error-city="form.errors.has('deliveryCity') ? form.errors.get('deliveryCity') : ''"
            :error-state="form.errors.has('deliveryState') ? form.errors.get('deliveryState') : ''"
            :error-postcode="form.errors.has('deliveryPostcode') ? form.errors.get('deliveryPostcode') : ''"
            @address-updated="addressUpdated"
          >
            <template v-slot:street-label>
              <h4 class="text-lg font-semibold text-gray-900 mb-4">
                {{ isPickup ? 'Shipping Address (Optional)' : 'Shipping Address' }}
              </h4>
            </template>
          </address-input>
        </div>

        <div class="pt-8 border-t border-gray-200">
          <address-input
            ref="billingAddressDetails"
            v-model:street="form.billingStreet"
            street-input="billingStreet"
            v-model:city="form.billingCity"
            city-input="billingCity"
            v-model:state="form.billingState"
            state-input="billingState"
            v-model:postcode="form.billingPostcode"
            postcode-input="billingPostcode"
            :error-street="form.errors.get('billingStreet')"
            :error-city="form.errors.has('billingCity') ? form.errors.get('billingCity') : ''"
            :error-state="form.errors.has('billingState') ? form.errors.get('billingState') : ''"
            :error-postcode="form.errors.has('billingPostcode') ? form.errors.get('billingPostcode') : ''"
          >
            <template v-slot:street-label>
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Billing Address</h4>
            </template>
            <template v-slot:rightStreetLabel>
              <button
                v-if="!provider.isPickup"
                type="button"
                class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="copyShippingAddress"
              >
                Copy Shipping
              </button>
            </template>
          </address-input>
        </div>
      </div>

      <!-- Right Column: Order Summary & Payment -->
      <div class="space-y-8">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 border-b-2 border-indigo-600 pb-2 mb-6">Order Details</h3>

          <div class="mb-6">
              <TextInput type="multiline" label="Order Notes (Optional)" v-model="form.Memo" :error="form.errors.get('Memo')" @change="clearErrors('Memo')" />
          </div>

          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <shopping-cart-list
              :show-address="false"
              :show-coupon-input="showCouponInput"
              :allow-edit="true"
              :hide-prices="!showPrices"
              :validate="true"
              :show-freight-providers="true"
              :on-provider-changed="onProviderChanged"
            ></shopping-cart-list>
          </div>
        </div>

        <div>
          <h3 class="text-2xl font-bold text-gray-900 border-b-2 border-indigo-600 pb-2 mb-6">Payment Details</h3>

            <div class="bg-white border rounded-lg p-6 border-gray-200 mb-6">
              <div v-if="user && allowOrder && user.accountGuid !== ''" class="">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Order on Account: <span class="font-bold">{{ user.company }}</span></span>
                  <button
                    type="button"
                    class="inline-flex items-center px-6 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    :disabled="!allowPayment"
                    @click="placeOrder"
                  >
                    Place Order
                  </button>
                </div>
                <div v-if="allowCard" class="relative my-6">
                  <div class="absolute inset-0 flex items-center" aria-hidden="true">
                    <div class="w-full border-t border-gray-300"></div>
                  </div>
                  <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500 uppercase tracking-widest text-xs">Or Pay Now with a Card</span>
                  </div>
                </div>
              </div>

              <div v-if="allowCard" class="">
                <div class="space-y-6">
                  <div>
                      <TextInput label="Name on Card" v-model="nameOnCard" :error="form.errors.get('nameOnCard')" @change="clearErrors('nameOnCard')" />
                  </div>

                  <div>
                    <label class="redglass-input-label mb-2">Card Details</label>
                    <div ref="cardRef" id="card-ref" class="block w-full rounded-md border border-gray-300 px-3 py-3 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500"></div>
                    <div id="error-message" class="mt-2 text-sm text-red-600"></div>
                  </div>

                  <!-- Honeypot -->
                  <div class="hidden">
                    <input ref="fax" type="text" v-model="fax" />
                  </div>

                  <div class="pt-4">
                    <button
                      type="button"
                      class="w-full inline-flex justify-center items-center px-8 py-4 border border-transparent text-xl font-bold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                      :disabled="!allowPayment || working"
                      @click="processPayment"
                    >
                      <vue-feather v-if="working" type="loader" animation="spin" animation-speed="fast" size="1.2rem" class="mr-3"></vue-feather>
                      Pay Now <span v-if="showPrices" class="ml-2">${{ cartTotal }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Processing Modal -->
    <div v-if="showProcessingModal" class="fixed inset-0 z-100 overflow-y-auto" aria-labelledby="processingLabel" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div v-if="errorMessage === ''">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
              <svg class="h-10 w-10 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="processingLabel">Processing Order</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">Please wait while we secure your order.</p>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <vue-feather type="alert-triangle" class="h-10 w-10 text-red-600"></vue-feather>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-red-900">Transaction Failed</h3>
              <div class="mt-2">
                <div class="text-sm text-red-700" v-html="errorMessage"></div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6">
              <button
                type="button"
                class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                @click="closeProcessingModal"
              >
                Close and Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.StripeElement {
  width: 100%;
  padding-top: 10px;
}
</style>

<!--<docs>-->
<!--Custom styling-->
<!--Headings = redglass-headers-->
<!--Pay Button = pay-button-->
<!--</docs>-->
