<script>
import  { v4 as uuidv4 } from "uuid";
import Customer from "./libraries/jl-data-objects/Contacts/Customer";
import {mapState} from 'pinia'
import {useCartStore}  from '../stores/cartStore'

export default {
    name: "ShoppingCartList",
    props: {
        allowEdit: { type: Boolean, default: true },
        hidePrices: { type: Boolean, default: false },
        validate: { type: Boolean, default: false },
        validatorUrl: { type: String, default: '/api/v1/validate-cart' },
        continueUrl: null,
        showFreightProviders: {type:Boolean, default: true},
        shippingOptionsTitle: { type: String, default: "Shipping Options"},
        freightListTitle: { type:String, default: "Postage" },
        showAddress: { type: Boolean, default: true},

        /**
         * Do we want to show the coupon code input?
         */
        showCouponInput: { type: Boolean, default: false },
        onProviderChanged: { type: Function, default: (e) => {} }
    },
    data() {
        return {
            freightWarning: false,
            controlId: uuidv4(),
        }
    },
    methods: {
        decrementQty(key, item) {
            if(item.Qty > 1 )
            {
                this.cart.incrementQty('menuItem', key, -1);
            }
        },
        validateShoppingCart() {
            let shippingData = this.cart.getShippingData();

            this.cart.validate(this.validatorUrl, shippingData).then(response => {
                this.$emit('cart-validated', this.cart)
                window.dispatchEvent(new CustomEvent("cart-validated", { detail: this.cart }));
            });
        },
        updateUsersAddress() {
            let addressChanged = false;
            if(window.Laravel.customer) {
                let user = new Customer(window.Laravel.customer)
                let deliveryAddress = user.getAddress()
                if(this.cart.shippingData.City !== deliveryAddress.city || this.cart.shippingData.State !== deliveryAddress.state || this.cart.shippingData.Postcode !== deliveryAddress.postcode) {
                    this.cart.shippingData.City = deliveryAddress.city
                    this.cart.shippingData.State = deliveryAddress.state
                    this.cart.shippingData.Postcode = deliveryAddress.postcode
                    addressChanged = true
                }
            }

            return addressChanged;
        },
        updateAddress(e) {
            this.cart.shippingData.City = e.city
            this.cart.shippingData.Postcode = e.postcode
            this.validateShoppingCart()
        }
    },
    watch: {
        'cart.freightProviderGuid': function(newValue, oldValue) {
            let provider = this.cart.getProvider();
            //console.log("Freight Provider Changed", newValue, oldValue, provider)

            if(!provider.isPickup && window.Laravel.customer) {
                // Let's reset the shipping data
                this.updateUsersAddress()
            }

            this.onProviderChanged(this.cart)

            let shippingData = this.cart.getShippingData();

            this.cart.validate(this.validatorUrl, shippingData).then(response => {
                this.$emit('cart-validated', this.cart)
                window.dispatchEvent(new CustomEvent("cart-validated", { detail: this.cart }));
            });
        }
    },
    computed: {
        ...mapState(useCartStore, {cart: "cart"}),
        continueButtonClass: function() {
            return 'btn btn-primary' + (this.cart.hasItems() ? '' : ' disabled');
        },
        provider: function () {
            return this.cart.getProvider();
        },
        userGuid: function () {
            return window.Laravel.user !== '' ? window.Laravel.user : null
        }
    },
    mounted() {
        // Let's update the cart to make sure it is still valid ????
        console.log("Mounting shopping cart list!")

        if(this.validate || this.updateUsersAddress()) {
            this.validateShoppingCart();
        }
    }
}
</script>

<template>
    <div>
        <table v-if="cart.count > 0" class="table table-sm" id="cartTable">
            <thead>
                <tr>
                    <th align="left" style="width: 45px">Qty</th>
                    <th width="100%">Item</th>
                    <th v-if="!hidePrices" align="right" class="text-end">Price</th>
                    <th v-if="allowEdit">&nbsp;</th>
                </tr>
            </thead>
            <tbody>
<!--                Invoices-->
                <tr v-for="(item, key) in cart.invoices" :key="key" :id="key">
                    <td align="left" :data-itemid="key"><a :href="'/account/invoices/' + key">Inv</a></td>
                    <td>{{ item.memo }}</td>
                    <td v-if="!hidePrices" align="right">${{ item.calTotal().toFixed(2) }}</td>
                    <td v-if="allowEdit" class="text-end pt-2"><button type="button" class="p-0 m-0 small-img-button" @click="cart.removeItem('invoice', key)">&nbsp;<vue-feather type="delete" size="1.2em"></vue-feather></button></td>
                </tr>

<!--                Menu Items-->
                <tr v-for="(item, key) in cart.menuitems" :key="key" :id="key">
                    <td v-if="allowEdit" align="left" :data-itemid="key" style="padding-top: 2px; padding-right: 0; padding-left: 0;">
                        <table style="background: none; padding: 0 !important; margin: 0 !important;">
                            <tbody>
                                <tr style="background: none; padding: 0 !important; margin: 0 !important;">
                                    <td style="background: none; padding: 5px 2px 2px 2px; border: none;" valign="bottom">
                                        <button type="button" class="rounded-circle p-0 m-0 small-img-button" @click="decrementQty(key, item);"><vue-feather type="minus-circle" size="1.2em" :stroke="(item.Qty < 2 ? 'lightgray' : 'black')"></vue-feather></button>
                                    </td>
                                    <td style="background: none; padding: 2px; border: none;">{{ item.Qty }}</td>
                                    <td style="background: none; padding: 5px 2px 2px 2px; border: none;">
                                        <button type="button" class="rounded-circle p-0 m-0 small-img-button" @click="cart.incrementQty('menuItem', key, 1)"><vue-feather type="plus-circle" size="1.2em"></vue-feather></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                    <td v-else align="left" :data-itemid="key">{{ item.Qty }}</td>
                    <td>
                        {{ item.name }}
                        <span v-if="item.profiles.length > 0" style="font-size: 0.8em;">
                            <span v-for="(profile, key) in item.profiles" :key="key">
                                <span v-if="profile.max === 1 && profile.min === 1">
                                    <span v-for="(cond, key) in profile.condiments" :key="key" v-if="cond.guid === profile.selected">
                                        <br />&nbsp;&nbsp;{{ cond.name }} <span class="text-muted" v-if="cond.stockGuid > 0 && cond.price > 0.00">(${{ cond.price }})</span>
                                    </span>
                                </span>
                                <span v-else>
                                    <span v-for="(cond, key) in profile.condiments" :key="key" v-if="cond.selected">
                                        <br />&nbsp;&nbsp;{{ cond.name }} <span class="text-muted" v-if="cond.stockGuid > 0 && cond.price > 0.00">(${{ cond.price }})</span>
                                    </span>
                                </span>
                            </span>
                        </span>
                    </td>
                    <td align="right">${{ item.calTotal().toFixed(2) }}</td>
                    <td v-if="allowEdit" class="text-end pt-2"><button type="button" class="p-0 m-0 small-img-button" @click="cart.removeItem('menuItem', key)"><vue-feather type="delete" size="1.2em"></vue-feather></button></td>
                </tr>

<!--                General Items-->
                <tr v-for="(item, key) in cart.items" :id="key" :key="key">
                    <td v-if="allowEdit" class="text-start" :data-itemid="key">
                        <input class="form-control form-control-sm" type="text" v-model="item.Qty" @input="cart.save()" pattern="[0-9]*" autocomplete="off" @focus="selectText($event.target)" style="width:40px;" />
                    </td>
                    <td v-else align="left" :data-itemid="key">{{ item.Qty }}</td>
                    <td class="text-start align-middle">{{ item.name }}</td>
                    <td v-if="!hidePrices" class="text-end align-middle">${{ item.calTotal().toFixed(2) }}</td>
                    <td v-if="allowEdit" class="text-start align-middle pt-2"><button type="button" class="p-0 m-0 small-img-button" @click="cart.removeItem('stockItem', key)"><vue-feather type="delete" size="1.2em"></vue-feather></button></td>
                </tr>
            </tbody>
            <tfoot v-if="!hidePrices">
                <tr v-if="showFreightProviders">
                    <td colspan="4">
                        <div class="container p-0 d-block">
                            <h6><strong>{{ shippingOptionsTitle }}</strong></h6>
                            <div v-if="!provider.isPickup && showAddress" class="pb-1">
                                <address-input
                                    v-if="!provider.isPickup && showAddress"
                                    :show-street="false"
                                    :show-state="false"
                                    :city.sync="cart.shippingData.City"
                                    :state.sync="cart.shippingData.State"
                                    :postcode.sync="cart.shippingData.Postcode"
                                    @address-updated="updateAddress"
                                >
                            </address-input>
                            </div>
                            <div v-for="provider in cart.freightProviders.filter(p => p.showOnWeb)" class="custom-control custom-radio">
                              <input type="radio" :name="'providerRadio_' + controlId" :id="'rb_' + provider.guid" :value="provider.guid" v-model="cart.freightProviderGuid" class="custom-control-input">
                              <label class="custom-control-label ps-1" :for="'rb_' + provider.guid">{{ provider.name }} - {{ provider.description }}</label>
                            </div>
                        </div>
                    </td>
                </tr>

                <tr v-if="!(this.$slots.shippingOptionsFooter || [])[0]">
                    <td colspan="4" class="border-0">
                        <!-- @slot Use this for the shipping options footer -->
                        <slot name="shipping-options-footer"></slot>
                    </td>
                </tr>

                <tr v-if="cart.freightList.length > 0" class="border-0">
                    <th colspan="4" class="border-0">
                        <!-- @slot Use this for the freight list header -->
                        <slot name="freight-list-heading">{{ freightListTitle }}</slot>
                    </th>
                </tr>

                <tr v-for="(item, key) in cart.freightList" :id="key" :key="key">
                    <td align="left" :data-itemid="key">{{ item.qty }}</td>
                    <td>{{ item.name }}</td>
                    <td v-if="!hidePrices" align="right">${{ item.calTotal().toFixed(2) }}</td>
                    <td v-if="allowEdit" class="text-end pt-2" valign="top"></td>
                </tr>

                <tr v-if="freightWarning"><th colspan="4">Login to see freight charges.</th></tr>
                <tr v-else-if="!!(this.$slots.freightListFooter || [])[0]">
                    <td colspan="4" class="border-0">
                        <!-- @slot Use this for the fright list footer -->
                        <slot name="freight-list-footer"></slot>
                    </td>
                </tr>

                <tr>
                    <th colspan="2" class="text-end">Total:</th>
                    <th class="text-end">$<span v-text="cart.totalWithFreight.toFixed(2)"></span></th>
                    <td v-if="allowEdit"></td>
                </tr>

                <tr v-if="showCouponInput">
                    <td colspan="4">
                        <label class="control-label col-12">Coupon Code</label>
                        <div class="input-group mb-3">
                          <input type="text" class="form-control" v-model="cart.couponString" @change="validateShoppingCart" placeholder="Coupon Code" aria-label="Coupon Code">
                          <button class="btn btn-outline-secondary" style="border-bottom-left-radius: 0px !important; border-top-left-radius: 0px !important;" type="button" @click="validateShoppingCart">Apply</button>
                        </div>
<!--                        <input type="text" class="form-control" v-model="cart.couponString" @change="validateShoppingCart" placeholder="Coupon Code"/>-->
                    </td>
                </tr>

                <tr v-if="!!(this.$slots.cartFooter || [])[0]">
                    <td colspan="4">
                        <!-- @slot Use this for the cart footer -->
                        <slot name="cart-footer"></slot>
                    </td>
                </tr>
            </tfoot>
        </table>
        <div v-else><h5>Your Cart is Empty!</h5></div>

        <div v-if="continueUrl" class="row">
            <div class="col text-end">
                <a :class="continueButtonClass" id="continue" :href="continueUrl">Continue</a>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .small-img-button {
        background-color: transparent;
        border: none;
        width: 16px;
        height: 16px;
        outline: none;
    }
</style>
