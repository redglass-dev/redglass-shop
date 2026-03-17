<template>
    <div class="container">
        <div class="row">
            <div class="col-sm">
                <h3 class="redglass-header">
                    <span v-if="isPickup">Details</span>
                    <span v-else>Shipping Details</span></h3>
                <hr class="my-0"/>

                <div class="form-row">
                    <div v-if="shippingInfo !== ''" class="alert alert-info mt-2 p-1" role="alert">
                        {{ shippingInfo }}
                    </div>

                    <div v-if="!allowAddress && !invalidAddress" class="alert alert-danger mt-2 p-1" role="alert">
                        We do not ship to this address.
                    </div>

                    <div v-if="invalidAddress" class="alert alert-danger mt-2 p-1" role="alert">
                        <strong>Please enter a valid address for this order!</strong>
                    </div>
                </div>

                <div class="form-row">
                    <div v-if="allowPickup" class="custom-control custom-checkbox py-2">
                        <input type="checkbox" class="custom-control-input" id="Pickup" name="Pickup"
                               @change="addressUpdated" v-model="isPickup" value="true" :disabled="pickupOnly">
                        <label class="custom-control-label" for="Pickup">Pickup</label>
                    </div>
                </div>

                <div v-if="showDeliveryDate || isPickup" class="form-row">
                    <div class="form-group col-sm-12">
                        <label for="RequiredDate"
                               class="control-label-sm border-bottom">{{ isPickup ? 'Pickup At' : 'Date' }}</label>
                        <flat-pickr
                            id="RequiredDate"
                            ref="requiredDate"
                            :config="datePickerConfig"
                            :class="'form-control' + (form.errors.has('RequiredDate') ? ' is-invalid' : '')"
                            placeholder="Select date"
                            name="RequiredDate"
                            v-model="date">
                        </flat-pickr>
                        <small class="invalid-feedback" v-text="form.errors.get('RequiredDate')"></small>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-sm-12">
                        <div class="d-flex flex-row  justify-content-between">
                            <label for="email" class="control-label">Email</label>
                            <a v-if="!customer" class="btn btn-secondary btn-xs" href="/login">Login</a>
                        </div>
                        <input type="text" name="email" @change="clearErrors('Email')"
                               :class="'form-control' + (form.errors.has('Email') ? ' is-invalid' : '')" required
                               autofocus v-model="form.Email"/>
                        <small class="invalid-feedback" v-text="form.errors.get('Email')"></small>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-sm-12">
                        <label class="control-label" for="Company">Company</label>
                        <input type="text" name="Company" @change="clearErrors"
                               :class="'form-control' + (form.errors.has('Company') ? ' is-invalid' : '')"
                               placeholder="Company" v-model="form.Company"/>
                        <small class="invalid-feedback" v-text="form.errors.get('Company')"></small>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-sm-12">
                        <label class="control-label" for="FirstName">First Name</label>
                        <input type="text" name="FirstName" @change="clearErrors('FirstName')"
                               :class="'form-control' + (form.errors.has('FirstName') ? ' is-invalid' : '')"
                               placeholder="First Name" v-model="form.FirstName"/>
                        <small class="invalid-feedback" v-text="form.errors.get('FirstName')"></small>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-sm-12">
                        <label class="control-label" for="LastName">Last Name</label>
                        <input type="text" name="LastName" @change="clearErrors('LastName')"
                               :class="'form-control' + (form.errors.has('LastName') ? ' is-invalid' : '')"
                               placeholder="Last Name" v-model="form.LastName"/>
                        <small class="invalid-feedback" v-text="form.errors.get('LastName')"></small>
                    </div>
                </div>

                <div class="form-row pb-2">
                    <div class="form-group col-sm-12">
                        <label for="Phone" class="control-label">Phone</label>
                        <input type="text" name="Phone" @change="clearErrors('Phone')"
                               :class="'form-control' + (form.errors.has('Phone') ? ' is-invalid' : '')"
                               placeholder="Phone" v-model="form.Phone"/>
                        <small class="invalid-feedback" v-text="form.errors.get('Phone')"></small>
                    </div>
                </div>

                <div v-bind:class="{ 'd-none': provider.isPickup }">
                    <hr class="my-0"/>
                    <address-input v-if="!isPickup || showAddressForPickup"
                                   ref="addressDetails"
                                   v-model:street="form.deliveryStreet"
                                   street-input="deliveryStreet"
                                   v-model:city="form.deliveryCity"
                                   city-input="deliveryCity"
                                   v-model:state="form.deliveryState"
                                   state-input="deliveryState"
                                   v-model:postcode="form.deliveryPostcode"
                                   postcode-input="deliveryPostcode"
                                   :error-street="form.errors.has('deliveryStreet') ? form.errors.get('deliveryStreet') : ''"
                                   :error-city="form.errors.has('deliveryCity') ? form.errors.get('deliveryCity'): ''"
                                   :error-state="form.errors.has('deliveryState') ? form.errors.get('deliveryState') : ''"
                                   :error-postcode="form.errors.has('deliveryPostcode') ? form.errors.get('deliveryPostcode') : ''"
                                   @address-updated="addressUpdated">
                        <template v-slot:street-label>
                            <span v-if="isPickup" class="underline">Shipping Address <span class="text-secondary">(Optional)</span></span>
                            <span v-else class="underline font-weight-bold">Shipping Address</span>
                        </template>
                    </address-input>
                </div>
                <div class="mt-2">
                    <hr class="my-0 mb-1"/>
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
                        :error-street="form.errors.has('billingStreet') ? form.errors.get('billingStreet') : ''"
                        :error-city="form.errors.has('billingCity') ? form.errors.get('billingCity'): ''"
                        :error-state="form.errors.has('billingState') ? form.errors.get('billingState') : ''"
                        :error-postcode="form.errors.has('billingPostcode') ? form.errors.get('billingPostcode') : ''">

                        <template v-slot:street-label>
                            <span class="underline font-weight-bold">Billing Address</span>
                        </template>
                        <template v-slot:rightStreetLabel>
                            <button v-if="!provider.isPickup" class="btn btn-primary btn-xs"
                                    @click="copyShippingAddress">Copy Shipping
                            </button>
                        </template>
                    </address-input>
                </div>
            </div>

            <div class="col-sm">
                <h3 class="redglass-header">Order Details</h3>
                <hr class="my-0"/>

                <div class="row">
                    <div class="form-group col-12">
                        <label class="control-label">Notes</label>
                        <input type="text" name="Memo" class="form-control" placeholder="Notes" v-model="form.Memo"/>
                    </div>
                </div>

                <div class="col-12 m-0 p-0">
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

                <!--                Payment Details-->
                <h3 class="redglass-header pt-3">Payment Details</h3>
                <hr class="my-0"/>
                <table v-if="user && allowOrder && user.accountGuid !== ''" class="table table-sm border-0">
                    <!-- If we are allowing orders on this shop -->
                    <tbody id="orderbody">
                    <tr>
                        <td colspan="4" class="border-0">Order on Account {{ user.company }}</td>
                        <td class="text-end border-0">
                            <button ref="orderButton" type="button" @click="placeOrder" formaction="/placeorder"
                                    name="order" :disabled="!allowPayment" class="btn btn-sm btn-primary pay-button">
                                Place Order
                            </button>
                        </td>
                    </tr>
                    <tr v-if="allowCard">
                        <td colspan="5" class="text-center border-0">Or Pay Now with a Card</td>
                    </tr>
                    </tbody>
                </table>

                <!-- If we allow credit carts lets show the new card button -->
                <div v-if="allowCard" class="row">
                    <div class="col text-end">
                        <div class="form-group pb-1">
                            <label class="form-label">Name on Card</label>
                            <input ref="cardHolderName" @change="clearErrors('nameOnCard')" type="text"
                                   class="form-control" v-model="nameOnCard" required="required"
                                   :class="'form-control' + (form.errors.has('nameOnCard') ? ' is-invalid' : '')">
                            <small class="invalid-feedback" v-text="form.errors.get('nameOnCard')"></small>
                        </div>

                        <!-- Stripe Elements Placeholder -->
                        <div class="form-group">
                            <label class="form-label visually-hidden">Card Details</label>
                            <div ref="cardRef" id="card-ref" class="form-control mb-2"></div>
                            <div id="error-message">
                                <!-- Display error message to your customers here -->
                            </div>
                        </div>

                        <div class="form-group fax">
                            <label class="form-label"></label>
                            <!--                            TODO: Fix for output-->
                            <input ref="fax" id="fax" type="text" class="form-control" value="" :model="fax">
                        </div>

                        <div v-if="recaptchaSiteKey !== ''" class="form-group">
                            <div class="w-100 ps-auto pb-3  justify-content-end">
                                <!--                                <vue-recaptcha :sitekey="recaptchaSiteKey" @verify="reCaptchaDataCallback" @expired="reCaptureExpiring" class="float-right">-->
                                <!--                                </vue-recaptcha>-->
                            </div>

                            <button v-if="captureCompleted" id="card-button" type="button"
                                    class="btn btn-sm btn-success pay-button w-100" :disabled="!allowPayment"
                                    @click="processPayment">
                                <vue-feather v-if="working" type="loader" animation="spin" animation-speed="fast"
                                             size="1.0em"></vue-feather>
                                Pay<span v-if="showPrices"> ${{ cartTotal }}</span>
                            </button>
                        </div>
                        <div v-else class="form-group">
                            <button id="card-button" type="button" class="btn btn-sm btn-success pay-button w-100"
                                    :disabled="!allowPayment" @click="processPayment">
                                <vue-feather v-if="working" type="loader" animation="spin" animation-speed="fast"
                                             size="1.0em"></vue-feather>
                                Pay<span v-if="showPrices"> ${{ cartTotal }}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <input type="hidden" id="cart" name="cart"/>
            </div>
        </div>

        <!-- Modal -->
        <b-modal ref="processingModal"
                 :hide-header-close="true"
                 :no-close-on-backdrop="true"
                 :no-close-on-esc="true"
                 :hide-footer="true"
                 :hide-header="true"
        >
            <template #model-header>
                <h4 class="modal-title" id="processingLabel">Processing Order<span v-if="errorMessage !== ''" class="text-danger"> (Error)</span></h4>
            </template>

            <template #default>
                <div v-if="errorMessage === ''" class="container-fluid text-center">
                    <b-spinner variant="success" label="Processing"></b-spinner>
                    <div class="ps-2 pt-3">Processing your order please wait.</div>
                </div>
                <div v-else class="container-fluid text-center text-danger">
                    <vue-feather type="alert-triangle" size="1.5em"></vue-feather>
                    <div v-html="errorMessage"  class="pt-3"></div>
                    <button class="btn btn-danger mt-3" @click="processingModal.hide()">Close</button>
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script setup>

import Form from './libraries/jl-general/helpers/Form'
import ConfirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate'
import 'flatpickr/dist/plugins/confirmDate/confirmDate.css'
import Formatter from './libraries/jl-general/helpers/Formatter';
import AddressInput from "./libraries/jl-general/controls/AddressInput.vue";
// import { useRecaptchaProvider } from 'vue-recaptcha'
import FreightProvider from "./libraries/jl-data-objects/Pos/FreightProvider";
import {onMounted, ref, computed, nextTick} from "vue";
import {useCartStore} from "../stores/cartStore"
import {BModal, BSpinner} from 'bootstrap-vue-next'

const emit = defineEmits(['cart-validated'])

const props = defineProps({
    stripeKey: {type: String, required: true},
    allowOrder: {type: Boolean, default: true},
    showDeliveryDate: {type: Boolean, default: false},
    showPrices: {type: Boolean, default: true},
    allowCard: {type: Boolean, default: true},
    deliveryAddress: {type: Object, default: {}},
    billingAddress: {type: Object, default: {}},
    user: {type: Object, default: {}},
    fax: {type: String, default: ''},

    /**
     * If true allows pick option with no shipping.
     * @default true
     */
    allowPickup: {type: Boolean, default: true},

    /**
     * If true pickup is selected by default
     * @default false
     */
    preferPickup: {type: Boolean, default: false},

    /**
     * Pickup Only.
     */
    pickupOnly: {type: Boolean, default: false},

    /**
     * Show address for pickup
     */
    showAddressForPickup: {type: Boolean, default: true},

    /**
     * If true a valid shipping zone is required otherwise we do not ship.
     * @default false
     */
    requireZone: {type: Boolean, default: false},

    /**
     * Do we want to show the coupon code input?
     */
    showCouponInput: {type: Boolean, default: false},


    recaptchaSiteKey: {type: String, default: ""},
})

let stripe = null
let cardElement = null

const showProcessing = ref(false)
const date = ref(new Date())
const paymentMethod = ref({})
const working = ref(false)
const allowPayment = ref(false)
const allowAddress = ref(true)
const shippingInfo = ref('')
const cartString = ref('')
const errorMessage = ref('')
const nameOnCard = ref('')
const isPickup = ref(false)
const invalidAddress = ref(false)
const captureCompleted = ref(false)
const customer = ref(window.Laravel.customer)
const store = useCartStore()

const cardRef = ref(null)
const addressDetails = ref(null)
const billingAddressDetails = ref(null)
const processingModal = ref(null)

const datePickerConfig = {
    //wrap: true,
    // static: true,
    weekNumbers: true,
    enableTime: true,
    dateFormat: 'Y-m-d H:i:S',
    altFormat: 'd/m/Y h:i K',
    altInput: true,
    plugins: [new ConfirmDatePlugin({confirmText: 'Done', confirmIcon: ""})],
    position: 'auto center',
    minDate: new Date(new Date().getTime() - 60000),
    minuteIncrement: 15
}

const cartTotal = computed(() => {
    return store.cart.total.toFixed(2);
})

const provider = computed(() => {
    return new FreightProvider(store.cart.getProvider());
})

const form = ref(new Form({}))

// useRecaptchaProvider()

function onProviderChanged(e) {
    let provider = e.getProvider()
    if (provider && !provider.isPickup) {
        e.shippingData.City = form.value.deliveryCity
        e.shippingData.State = form.value.deliveryState
        e.shippingData.Postcode = form.value.deliveryPostcode
        updateZone({city: e.shippingData.City, postcode: e.shippingData.Postcode})
    } else if (provider) {
        updateZone({city: provider.pickupCity, postcode: provider.pickupPostcode})
    }

    cartValidated(store.cart)
}

function reCaptchaDataCallback(responseToken) {
    console.log("Callback hit");

    if (form.value.hasOwnProperty('_token')) {
        form.value.removeField('_token');
    }

    form.value.addField('_token', responseToken);

    captureCompleted.value = true;
}

function reCaptureExpiring() {
    captureCompleted.value = false;
}

function clearErrors(field = '') {
    if (form.value.errors.any()) {
        if (field === '') {
            form.value.errors.clearAll();
        } else {
            form.value.errors.clear(field)
        }

        addressUpdated();
    }
}

function addressUpdated() {
    shippingInfo.value = '';
    nextTick(() => {
        validateCart();
    });
}

function loadAddress(address) {
    form.value = new Form(address);
    addressDetails.value?.setLocation(address.deliveryCity, address.deliveryPostcode, address.deliveryState);
    billingAddressDetails.value?.setLocation(address.billingCity, address.billingPostcode, address.billingState)
    form.value.addField('FirstName', props.user ? props.user.firstName : '');
    form.value.addField('LastName', props.user ? props.user.lastName : '');
    form.value.addField('Company', props.user ? props.user.company : '');
    form.value.addField("Email", props.user ? props.user.email : '')
    form.value.addField('Memo', '');
}

function placeOrder() {
    if (!props.allowOrder) {
        return;
    }

    form.value.addField('fax', props.fax);
    // Show processing modal
    processingModal.value.show();

    cartString.value = JSON.stringify(store.cart);
    //console.log(local.cartstring);
    form.value.addField('cart', cartString.value);
    form.value.addField("Pickup", isPickup.value);

    if (props.showDeliveryDate || isPickup.value) {
        form.value.addField('RequiredDate', Formatter.formatDate(date.value));
    }

    let data = Object.assign({freightProviderGuid: provider.value.guid}, form.value)

    if (provider.value.isPickup) {
        data = {...data, ...provider.value.getAddress(true)}
    }

    // Let's send the payment to php
    axios.post('/api/v1/process-order', Object.assign({}, data)).then(response => {
        console.log(response);
        if (response.status === 200 && (response.data.status === 'success')) {
            // Let's move forward
            store.cart.clear();
            window.location.href = '/orderplaced/' + response.data.salesOrderGuid;
        } else {
            if (response.data.hasOwnProperty('error')) {
                errorMessage.value = response.data.error;
            } else {
                errorMessage.value = "Failed to process order!";
            }
        }
    }).catch(error => {
        console.log(error);
        errorMessage.value = "Failed to process payment!<br />" + error.message;
        // form.value.errors.record(error.response.data)
        // errorMessage.value = "Failed to process order!<br />" + error.response.data.message;
        // for (let key in error.response.data.errors) {
        //     errorMessage.value += "<br />" + error.response.data.errors[key];
        // }
    });
}

async function processPayment() {
    if ( !props.allowCard ) {
        return;
    }

    allowPayment.value = false;

    if (!nameOnCard.value || nameOnCard.value.trim() === '') {
        form.value.errors.add("nameOnCard", 'Card name is required!');
        return;
    }

    form.value.addField('fax', props.fax);
    processingModal.value.show();
    console.log(nameOnCard.value, form.value.Email, cardElement, stripe)
    const results = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                    name: nameOnCard.value.trim(),
                    email: form.value.Email
            }
        }
    );

    console.log(results)
    if(!results.paymentMethod) {
        errorMessage.value = "No payment Method";
        cartValidated(store.cart);
    }
    else if (results.error) {
        // Display "error.message" to the user...
        errorMessage.value = results.error.message;
        cartValidated(store.cart);
    } else {
        // The card has been verified successfully...
        paymentMethod.value = results.paymentMethod;
        cartString.value = JSON.stringify(store.cart);

        form.value.addField('paymentMethod', paymentMethod.value.id);
        form.value.addField('cart', cartString.value);
        form.value.addField("Pickup", isPickup.value);

        if (props.showDeliveryDate || isPickup.value) {
            form.value.addField('RequiredDate', Formatter.formatDateTime(date.value));
        }

        let data = Object.assign({freightProviderGuid: provider.value.guid}, form.value)

        if (provider.value.isPickup) {
            data = {...data, ...provider.value.getAddress(true)}
        }

        // Let's send the payment to php
        axios.post('/api/v1/process-payment', data).then(response => {
            if (response.status === 200 && (response.data.status === 'success')) {
                // Let's move forward
                store.cart.clear();
                window.location.href = '/invoiceplaced/' + response.data.salesInvoiceGuid;
            } else {
                errorMessage.value = response.data.error;
                form.value.errors.record(response.data);
            }
        }).catch(error => {
            console.log(error);
            errorMessage.value = "Failed to process payment!<br />" + error.message;
        });
    }
}

async function updateZone(address) {
    let found = false;
    allowAddress.value = isPickup.value;
    invalidAddress.value = false;

    let response = await axios.get('/api/v1/public/zones/' + address.city + '/' + address.postcode)
    let zone = response.data.description;

    if (typeof zone !== 'undefined') {
        found = true;

        if (zone !== '') {
            shippingInfo.value = zone;
            allowAddress.value = true;
        }
    }

    if (props.requireZone && !isPickup.value && !found) {
        allowAddress.value = false;
    } else {
        allowAddress.value = true;
    }

    return response;
}

function validateCart(changed = "none") {
    working.value = true;
    allowPayment.value = false;

    // Let's get the zone first
    let address = {city: "", postcode: ""};

    if (addressDetails.value) {
        if (store.cart.getProvider()?.isPickup && store.cart.getProvider()) {
            let provider = new FreightProvider(store.cart.getProvider())
            address = provider.getAddress()
        } else {
            address = addressDetails.value.getAddress();
        }
    }

    // Lets valid the cart without zones
    if (isPickup.value) {
        invalidAddress.value = false;
        store.cart.validate('/api/v1/validate-cart', {
            City: address.city,
            Postcode: address.postcode,
            Changed: changed,
            Pickup: isPickup.value
        }).then(response => {
            cartValidated(store.cart);
            if (Object.keys(store.cart.invoices).length > 0) {
                $("#orderbody").hide();
            } else {
                $("#orderbody").show();
            }
        });
        return;
    }

    // axios.get('/api/v1/public/zones/' + address.city + '/' + address.postcode).then( response => {
    //     var zone = response.data.description;
    //     var found = false;
    //     allowAddress.value = isPickup.value;
    //     invalidAddress.value = false;
    //
    //     if(typeof zone !== 'undefined') {
    //         found = true;
    //
    //         if(zone !== '') {
    //             shippingInfo.value = zone;
    //             allowAddress.value = true;
    //         }
    //     }
    //
    //     if(props.requireZone && !isPickup.value && !found) {
    //         allowAddress.value = false;
    //         return;
    //     } else {
    //         allowAddress.value = true;
    //     }
    updateZone(address).then(response => {
        // Let's not waste our time doing a validation if the address is not allowed
        if (!allowAddress.value) {
            return;
        }

        store.cart.validate('/api/v1/validate-cart', {
            City: address.city,
            Postcode: address.postcode,
            Changed: changed,
            Pickup: isPickup.value
        }).then(response => {
            cartValidated(store.cart);
            emit('cart-validated', store.cart)
            if (Object.keys(store.cart.invoices).length > 0) {
                $("#orderbody").hide();
            } else {
                $("#orderbody").show();
            }
        });
    }).catch(e => {
        invalidAddress.value = !isPickup.value;
    });
}

function cartValidated(cart) {
    let cs = JSON.stringify(cart);
    if (cs == null || !cart.hasItems()) {
        cartString.value = '';
        working.value = false;
        return;
    }

    cartString.value = cs;

    $('#order').removeClass('disabled');

    allowPayment.value = allowAddress.value;
    form.value.errors.clear("Phone");
    // Let's check if the deliveryPhone number is set
    if (!form.value.Phone || form.value.Phone.trim() === '') {
        allowPayment.value = false;
        form.value.errors.add("Phone", 'A phone number is required!');
    }

    if (!form.value.Email || form.value.Email.trim() === '') {
        allowPayment.value = false;
        form.value.errors.add("Email", 'A email is required!');
    }

    form.value.errors.clear("FirstName");
    if (!form.value.FirstName || form.value.FirstName.trim() === '') {
        allowPayment.value = false;
        form.value.errors.add("FirstName", 'A first name is required!');
    }

    form.value.errors.clear("LastName");
    if (!form.value.LastName || form.value.LastName.trim() === '') {
        allowPayment.value = false;
        form.value.errors.add("LastName", 'A last name is required!');
    }

    form.value.errors.clear("nameOnCard");
    if (!nameOnCard.value || nameOnCard.value.trim() === '') {
        allowPayment.value = false;
        form.value.errors.add("nameOnCard", 'Card name is required!');
    }

    working.value = false;
}

function cancel() {
    allowPayment.value = allowAddress.value;
    errorMessage.value = '';
    processingModal.value.hide();
}

function copyShippingAddress() {
    console.log("Befor", form.value.data())
    form.value.billingStreet = form.value.deliveryStreet
    form.value.billingCity = form.value.deliveryCity
    form.value.billingState = form.value.deliveryState
    form.value.billingPostcode = form.value.deliveryPostcode
    form.value.billingCountry = form.value.deliveryCountry
    console.log("After", form.value.data())
}

onMounted(() => {
    // Testing only
    // errorMessage.value = "Failed to process payment"
    // processingModal.value.show();
    // console.log("Mounted", store.cart)
    // console.log({...deliveryAddress.value, ...billingAddress.value});
    loadAddress({...props.deliveryAddress, ...props.billingAddress});
    validateCart();

    if (props.allowCard) {
        // Create the stripe object.
        stripe = window.Stripe(props.stripeKey);

        // Lets mount the stripe elements
        const elements = stripe.elements();

        cardElement = elements.create('card');
        cardElement.mount(cardRef.value);
    }

    if (props.user) {
        nameOnCard.value = props.user.firstName + ' ' + props.user.lastName;
    }

    if (props.allowPickup) {
        if (props.pickupOnly) {
            isPickup.value = true;
            addressUpdated();
            return isPickup.value;
        }

        isPickup.value = props.preferPickup;
    }
})

//function addCoupon( value ){
//     console.log("coupon added to cart! : " + value);
//     store.cart.addCoupon(value);
//     store.cart.save();
//
//     // Let's get the zone first
//     let address = {city: "", postcode: ""};
//
//     if(this.$refs.addressDetails) {
//         address = this.$refs.addressDetails.getAddress();
//     }
//
//     store.cart.validate('/api/v1/validate-cart', { City: address.city, Postcode: address.postcode, Changed: 'none' , Pickup: isPickup.value }).then(response => {
//         // this.cartValidated(store.cart);
//         // if(Object.keys(store.cart.invoices).length > 0) {
//         //     $("#orderbody").hide();
//         // } else {
//         //     $("#orderbody").show();
//         // }
//     });
// }

</script>

<style>
.StripeElement {
    padding-top: 10px;
}

.fax {
    display: none;
}
</style>

<!--<docs>-->
<!--Custom styling-->
<!--Headings = redglass-headers-->
<!--Pay Button = pay-button-->
<!--</docs>-->
