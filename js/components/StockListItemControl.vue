<template>
    <div class="container-fluid pe-0 ps-0 h-100 d-flex align-items-end flex-column bg-white">
        <div class="p-0 m-0 w-100">
            <a v-if="localStock.wideImage" @click="$emit('more-info')" :class="imageBoxClass"
               :style="imageBoxStyle" style="position: relative; ">
                <img class="card-img-top img-fluid w-100 rounded-0" :src="localStock.wideImage.uriLink"
                     :alt="localStock.wideImage.description"/>
                <div v-if="localStock.unAvailable" class="w-auto" style="position: absolute; bottom: 0px; left: 0px;">
                    <div class="px-2 bg-danger rounded-0"> <!-- flex-nowrap rounded-0 border-dark  bg-danger pb-1"> -->
                        <span class="m-0 w-auto text-center text-light"> {{ localStock.unavailableLabel }}</span>
                    </div>
                </div>

                <!--                The following is a on sale banner similar to the unavailable label one -->

                <!--                <div v-if="!localStock.unAvailable && (localStock.onSale && (localStock.accountInc >= localStock.saleInc))" class="w-auto" style="position: absolute; bottom: 0px; left: 0px;">-->
                <!--                    <div class="px-2 bg-danger rounded-0"> &lt;!&ndash; flex-nowrap rounded-0 border-dark  bg-danger pb-1"> &ndash;&gt;-->
                <!--                        <span class="m-0 w-auto text-center text-light"> On Sale </span>-->
                <!--                    </div>-->
                <!--                </div>-->

            </a>
            <a v-else @click="$emit('more-info')" :class="imageBoxClass" :style="'text-decoration: none; ' + imageBoxStyle">
                <!--                <img class="card-img-top img-fluid w-100 rounded-0" :src="localStock.wideImage.uriLink" :alt="localStock.wideImage.description"/>-->
                <h4 class="placeholder-text">{{ localStock.stockDescription.toUpperCase()[0] }}</h4>
            </a>
        </div>

        <div :class="'row ' + (priceOnTitleRow ? 'flex-nowrap' : 'row-cols-1') + ' m-0 w-100'"
             @click="$emit('more-info')">
            <slot name="title" :text="localStock.stockDescription">
                <div class="card-title fs-5 fw-medium p-1 m-0">
                    {{ localStock.stockDescription }}
                </div>
            </slot>
        </div>

        <div v-if="showPrices" class="mt-auto row m-0 w-100 text-end">
            <slot name="price" :stock="localStock" :has-surface-area="localStock.surfaceArea > 0">
                <div :class="'card-title col' + (priceOnTitleRow ? '-auto float-right align-content-end' : '') + ' m-0 p-1'">
                    <div v-if="localStock.surfaceArea > 0" :style="((localStock.onSale && (localStock.accountInc >= localStock.saleInc)) ? 'text-decoration: line-through; opacity: 0.5;' : '' )">
                        <span class="fw-medium fs-5">${{  ((localStock.onSale && (localStock.accountInc == localStock.saleInc))) ? (localStock.retailInc.toFixed(2) / localStock.defaultCoverage).toFixed(2) : (localStock.accountInc.toFixed(2) / localStock.defaultCoverage).toFixed(2) }} <span class="align-baseline" style="font-size: .65rem">m<sup>2</sup></span></span><br />
                        <div class="fs-6 text-muted fw-normal">
                            <span v-if="localStock.boxesPerPallet > 0">${{  ((localStock.onSale && (localStock.accountInc == localStock.saleInc))) ? (localStock.retailInc * localStock.boxesPerPallet).toFixed(2) : (localStock.accountInc * localStock.boxesPerPallet).toFixed(2) }} <span class="align-baseline" style="font-size: .65rem">{{ localStock.unitType ? localStock.unitType.palletName : 'Pallets' }}</span><br/></span>
                            <span>${{  ((localStock.onSale && (localStock.accountInc == localStock.saleInc))) ? localStock.retailInc.toFixed(2) : localStock.accountInc.toFixed(2) }} <span v-if="showUnitType"  class="align-baseline" style="font-size: .65rem">{{ stock.unitType ? stock.unitType.name : 'Each' }}</span></span><br/>
                            <br  v-if="localStock.boxesPerPallet === 0" />
                        </div>
                    </div>
                    <span v-else class="fw-medium fs-5" :style="((localStock.onSale && (localStock.accountInc >= localStock.saleInc)) ? 'text-decoration: line-through; opacity: 0.5;' : '' )">
                            ${{  ((localStock.onSale && (localStock.accountInc == localStock.saleInc))) ? localStock.retailInc.toFixed(2) : localStock.accountInc.toFixed(2) }} <span v-if="showUnitType" class="align-baseline" style="font-size: .65rem">{{ stock.unitType ? stock.unitType.name : 'Each' }}</span><br />
                        </span>

                    <span v-if="localStock.onSale && (localStock.accountInc >= localStock.saleInc)" class="fw-medium fs-5">
                            ${{ localStock.saleInc.toFixed(2) }}<br />
                        </span>
                </div>
            </slot>
        </div>

        <div class="row m-0 w-100" :class="{'mt-auto': !showPrices}">
            <div class="col-12 p-1">
                <a v-if="showMoreInfoButton" :class="'btn w-100 ' + infoBtnClass" @click="$emit('more-info')">
                    More&nbsp;info
                </a>
            </div>
            <div v-if="showBuyButtons && localStock.unAvailable" class="col-12 p-1" @click="$emit('more-info')">
                <div class="input-group flex-nowrap rounded-0 border border-dark pb-1">
                    <span class="p-1 w-100 text-center text-dark mb-0"> {{ localStock.unavailableLabel }}</span>
                </div>
            </div>
            <div v-if="showBuyButtons && !localStock.unAvailable" class="col-12 p-1">
                <div class="input-group flex-nowrap">
                    <div v-if="showUnitType" class="input-group-prepend bg-white rounded-0 border border-dark border-right-0 align-bottom px-1">
                        <div class="mt-1" id="addon-wrapping">{{ localStock.unitType ? localStock.unitType.name : 'Qty' }}</div>
                    </div>
                    <input type="text"
                           class="rounded-0 border border-dark border-right-0 w-100 p-1 pb-2"
                           :class="{ 'border-left-0' : showUnitType }"
                           style="outline: none !important;" id="qty" pattern="[0-9]*" v-model="qty" name="qty"
                           aria-describedby="addon-wrapping"/>
                    <button :class="'btn nowrap ' + btnClass + ' rounded-left-0'" @click="buy()"
                            aria-describedby="addon-wrapping">Buy
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

import Form, {FormErrors} from './libraries/jl-general/helpers/Form'
import {StockItem} from '../Cart';
import Big from "big.js"
import Stock from './libraries/jl-data-objects/Stock/Stock'
import {mapState} from 'pinia'
import {useCartStore} from '../stores/cartStore'
import { push } from 'notivue'

/**
 * This is used to display the stock item in a list view.  This control does not have a modal.
 */
export default {
    name: "StockListItemControl",
    components: { },
    props: {
        /**
         * The GUID of the stock item that the StockViewControl displays.
         */
        stockGuid: {type: String},

        /**
         * The stock item as requested from server.
         *
         * Not required, but if parent has all ready loaded stock, it may be used to avoid duplicate requests to server.
         */
        stock: {type: Object, default: null},

        /**
         *  Does the list item control display the weight of the stock item.
         */
        showStockWeight: {type: Boolean, default: false},

        /**
         * The Guid of the account that is signed in.
         */
        accountGuid: {type: String, default: ''},

        /**
         * Does this stock item display the "More Info" button.
         */
        showMoreInfoButton: {type: Boolean, default: true},

        /**
         * Adds a class to the box surrounding the image.
         */
        imageBoxClass: {type: [String,Array,Object], default: ['w-100'] },

        /**
         * Adds style to the box surrounding the image.
         */
        imageBoxStyle: "width:100%;",

        btnClass: {type: String, default: "btn-dark rounded-0"},

        infoBtnClass: {type: String, default: "btn-dark rounded-0 border border-dark"},

        /**
         * Show buy buttons
         */
        showBuyButtons: {type: Boolean, default: true},

        /**
         * Show Prices.
         */
        showPrices: {type: Boolean, default: true},

        /**
         * Use single row for name and price
         *
         * Note: works better for long titles if this is turned off.
         */
        priceOnTitleRow: {type: Boolean, default: false},

        showUnitType: { type: Boolean, default: true }
    },
    computed: {
        ...mapState(useCartStore, {cart: "cart"}),
    },
    data() {
        return {
            qty: 1,
            loading: false,
            errors: new FormErrors(),
            localStock: new Stock(),
        };
    },
    mounted() {
        // Load the Stock if it has not been passed in from a parent.
        if (this.stock != null) {
            this.localStock = this.stock;
            //console.log(this.localStock)
            return;
        }

        this.loading = true;
        axios.get("/api/v1/public/stocks/" + this.stockGuid).then(response => {
            this.localStock = new Stock(response.data);
            this.loading = false;
        });
    },
    watch: {
        stock: function (val) {
            this.localStock = val;
        }
    },
    methods: {
        buy() {
            if (typeof this.localStock.options !== 'undefined' && this.localStock.options !== "") {
                /**
                 * Is fired when the user presses the more info button.
                 *
                 * @event more-info
                 */
                this.$emit('more-info');
                return;
            }

            if (!$.isNumeric(this.qty)) {
                this.errors.record({qty: ["Not a number"]})
            } else if (this.qty <= 0) {
                this.errors.record({qty: ["Purchase qty must not be negative!"]})
            } else {
                // Add item to cart
                let item = new StockItem();
                item.stockGuid = this.localStock.guid;
                item.name = this.localStock.stockDescription;
                item.value = Big(this.localStock.accountInc);
                item.weight = this.localStock.boxWeight;
                item.Qty = this.qty;

                this.cart.addItem('stockItem', '' + this.localStock.guid, item);

                /**
                 * Is fired when the user has added an item to the cart.
                 */
                this.$emit("added-to-cart");

                push.success(this.qty + ' ' + this.localStock.stockDescription + ' added to cart')
            }
        }
    }
}

</script>

<style scoped>
.rounded-left-0 {
    border-bottom-left-radius: 0 !important;
    border-top-left-radius: 0 !important;
}

.placeholder-text {
    color: grey;
    opacity: 25%;
    font-size: 10vh;
    text-align: center;
    text-decoration: none !important;
    margin-bottom: 14px;
}

</style>
