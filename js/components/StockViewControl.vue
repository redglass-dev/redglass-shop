<!-- This Vue will be used for the   -->

<template>
    <div :class="'d-flex pe-0 ps-0 border-0 ' + this.rowClass" :style="'background-color: white ' + this.rowStyle ">
        <div v-if="hasImages" class="flex-shrink-1 p-0 border-right-0 border-lg-right pb-1" :style="'min-width: ' + this.imageMinWidth">
            <slot name="carousel-header"></slot>

<!--         Carousel-->
            <div :id="'carousel-' + modalGuid" class="carousel slide carousel-fade" data-bs-ride="carousel"  :data-bs-interval="slideInterval">
                <!-- Slides -->
                <div class="carousel-inner m-0 p-0 mb-5 w-100">
                    <template v-for="(item, index) in localStock.images">
                        <div v-if="index === 0" class="carousel-item active">
                            <img class="d-block mx-auto" :src="item.uriLink" :alt="item.name" style="max-width: 100%"/>
                        </div>
                        <div v-else class="carousel-item">
                            <img class="d-block mx-auto" :src="item.uriLink" :alt="item.name" style="max-width: 100%"/>
                        </div>
                    </template>
                </div>

                <!-- Controls -->
<!--                <a class="carousel-control-prev" :data-bs-target="'#carousel-' + modalGuid" data-bs-slide="prev">-->
<!--                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>-->
<!--                </a>-->
<!--                <a class="carousel-control-next" :data-bs-target="'#carousel-' + modalGuid" data-bs-slide="next">-->
<!--                    <span class="carousel-control-next-icon" aria-hidden="true"></span>-->
<!--                </a>-->

                <div class="carousel-indicator mb-0 text-center">
                    <a v-for="(item, index) in localStock.images" :data-bs-target="'#carousel-' + modalGuid" :data-bs-slide-to="index" :class="index === 0 ? 'active p-1' : 'p-1'" :aria-label="'Slide ' + index">
                        <img class="rounded img-fluid" :src="item.uriLink" style="width: 80px; height: 80px;" />
                    </a>
                </div>
            </div>

        </div>

        <div v-if="!hasImages" class="col-12 col-lg-7 p-0 border-right-0 border-lg-right pb-1">
            <slot name="carousel-header"></slot>
            <div class="m-0 p-0 mb-5 w-100">
                <div class="">
                    <img class="d-block mx-auto" style="max-width: 100%"/>
                    <h2 style="color:grey;
                        opacity: 25%;
                        font-size: 35vh;
                        text-align: center;
                        text-decoration: none !important;">
                        {{localStock.stockDescription.toUpperCase()[0]}}
                    </h2>
                </div>
            </div>
        </div>

        <div class="w-100">
            <div class="d-flex align-items-start flex-column p-1 h-100" style="position: relative;">
                <div class="container p-1">
                    <slot name="card-header"></slot>
                    <slot name="title" :text="localStock.stockDescription">
                        <div class="card-title fs-5 fw-medium p-0 m-0">
                            {{ localStock.stockDescription }}
                        </div>
                    </slot>
                    <div v-if="showPrices" class="w-100 text-end">
                        <slot name="price" :stock="localStock" :has-surface-area="hasSurfaceArea">
                            <div v-if="hasSurfaceArea" :style="((localStock.onSale && (localStock.accountInc >= localStock.saleInc)) ? 'text-decoration: line-through; opacity: 0.5;' : '' )">
                                <span class="fw-medium fs-5">${{  ((localStock.onSale && (localStock.accountInc == localStock.saleInc))) ? (localStock.retailInc.toFixed(2) / localStock.defaultCoverage).toFixed(2) : (localStock.accountInc.toFixed(2) / localStock.defaultCoverage).toFixed(2) }} <span class="align-baseline" style="font-size: .65rem">m<sup>2</sup></span></span><br />
                                <div class="fs-6 text-muted fw-normal">
                                    <span v-if="localStock.boxesPerPallet > 0">${{  ((localStock.onSale && (localStock.accountInc == localStock.saleInc))) ? (localStock.retailInc * localStock.boxesPerPallet).toFixed(2) : (localStock.accountInc * localStock.boxesPerPallet).toFixed(2) }} <span class="align-baseline" style="font-size: .65rem">{{ localStock.unitType ? localStock.unitType.palletName : 'Pallets' }}</span><br/></span>
                                    <span>${{  ((localStock.onSale && (localStock.accountInc == localStock.saleInc))) ? localStock.retailInc.toFixed(2) : localStock.accountInc.toFixed(2) }} <span v-if="showUnitType" class="align-baseline" style="font-size: .65rem">{{ stock.unitType ? stock.unitType.name : 'Each' }}</span></span><br/>
                                    <br  v-if="localStock.boxesPerPallet === 0" />
                                </div>
                            </div>
                            <span v-else :style="((localStock.onSale && (localStock.accountInc >= localStock.saleInc)) ? 'text-decoration: line-through; opacity: 0.5;' : '' )" class="fw-medium fs-5">
                                ${{  ((localStock.onSale && (localStock.accountInc == localStock.saleInc))) ? localStock.retailInc.toFixed(2) : localStock.accountInc.toFixed(2) }} <span v-if="showUnitType" class="align-baseline" style="font-size: .65rem">{{ stock.unitType ? stock.unitType.name : 'Each' }}</span><br />
                            </span>

                            <span v-if="localStock.onSale && (localStock.accountInc >= localStock.saleInc)" class="fw-medium fs-5">
                                ${{ localStock.saleInc.toFixed(2) }}<br />
                            </span>
                        </slot>
                    </div>
                    <p class="card-text pt-2">
                        <span v-html="localStock.webDescription"></span>
                    </p>
                </div>

<!--            Lets show any options?-->
                <stock-option-control v-for="(group, index) in options" :key="index" :class="(index === 0 ? 'mt-auto' : '')" :group="group" :selected="group.selected" @selection-changed="setSelectedItemInGroup" :use-radio-buttons="useRadioButtons"></stock-option-control>

                <surface-area-calculator v-if="hasSurfaceArea" :stock="this.localStock" @qty-updated="updateQty" :qty="this.qty"></surface-area-calculator>

<!--            Lets show the buy buttons-->
                <div v-if="showBuyButtons && stock && !stock.unAvailable" :class="'row m-0 p-1 w-100' + (options.length === 0 ? ' mt-auto' : '')">
                    <div class="col input-group flex-nowrap p-0 mr-1">
                        <div v-if="showUnitType" class="input-group-prepend bg-white rounded-0 border border-dark border-right-0">
                            <div class="p-1" id="addon-wrapping">{{ stock.unitType ? stock.unitType.name : 'Qty' }} </div>
                        </div>
                        <input type="text"
                               class="form-control p-1 pb-2 rounded-0 border border-dark border-right-0 w-100"
                               :class="{ 'border-left-0' : showUnitType }"
                               style="outline: none !important;" id="qty" pattern="[0-9]*" v-model="qty" name="qty" aria-describedby="addon-wrapping"/>
                        <button :class="'btn nowrap ' + btnClass" @click="buy()" aria-describedby="addon-wrapping">Buy</button>
                    </div>
                </div>
                <div v-if="localStock.unAvailable" class="w-auto" style="position: absolute; bottom: 0; right: 0;">
                    <div class="px-3 py-2 bg-danger rounded-0"> <!-- flex-nowrap rounded-0 border-dark  bg-danger pb-1"> -->
                        <span class="m-0 w-auto text-center text-light"> {{ localStock.unavailableLabel }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Form, { FormErrors } from './libraries/jl-general/helpers/Form'
    import { StockItem } from '../Cart';
    import Big from "big.js"
    import Stock from './libraries/jl-data-objects/Stock/Stock'
    import  { v4 as uuidv4 } from "uuid";
    import StockOptionControl from "./StockOptionControl.vue";
    import SurfaceAreaCalculator from "./SurfaceAreaCalculator.vue";
    import {mapState} from 'pinia'
    import {useCartStore}  from '../stores/cartStore'
    import {push} from "notivue";

    /**
     * This is the detail view of a stock item.  Most commonly used in the stock modal.
     */
    export default {
        name: "StockViewControl",
        components: {
            StockOptionControl,
            SurfaceAreaCalculator
        },
        props: {
            /**
             * The GUID of the stock item that the StockViewControl displays.
             */
            stockGuid: { type: String},

            /**
             * The stock item as requested from server.
             *
             * Not required, but if parent has all, ready loaded stock, it may be used to avoid duplicate requests to server.
             */
            stock: {type: Object, default: null},

            /**
             * The Guid of the account that is signed in.
             */
            accountGuid: { type: String, default: ''},

            rowStyle: { type: String, default: "" },
            rowClass: { type: String, default: "" },

            /**
             * The interval in milliseconds for the carousel.
             */
            slideInterval: {type: String, default: "5000"},

            btnClass: { type: String, default: "btn-dark border-0 rounded-0"},

            /**
             * Use radio buttons for the options list.
             */
            useRadioButtons: {type: Boolean, default: false},

            /**
             * Show buy buttons
             */
            showBuyButtons: { type: Boolean, default: true },

            /**
             * Show Prices.
             */
            showPrices: { type: Boolean, default: true},

            showUnitType: { type: Boolean, default: true },

            imageMinWidth: { type: String, default: "400px" },
        },
        computed: {
            ...mapState(useCartStore, {cart: "cart"}),
            hasImages: function () {
                if(!this.stock || !this.stock.images) return false;
                return this.stock.images.length > 0;
            },
            hasSurfaceArea: function () {
                return this.localStock.surfaceArea > 0
            }
        },
        data() {
            return {
                qty: 1,
                loading: false,
                errors: new FormErrors(),
                localStock: new Stock(),
                modalGuid: uuidv4(),
                options: [],
            };
        },
        watch: {
            stock: function (val){
                this.loadStock(val);
            }
        },
        mounted() {
            // Load the Stock if it has not been passed in from a parent.
            if(this.stock != null) {
                this.loadStock(new Stock(this.stock));
                return;
            }

            // use axios to get stock details.
            this.loading = true;
            axios.get("/api/v1/public/stocks/" + this.stockGuid).then( response => {
                this.loadStock(new Stock(response.data));
                this.loading = false;
            });
        },
        methods: {
            updateQty(val) {
                this.qty = val;
            },
            update() {
                this.options = [];

                if(typeof this.localStock.options !== 'undefined' && this.localStock.options !== "") {
                    let tmpOptions = JSON.parse("[" + this.localStock.options + "]");

                    for (let key in tmpOptions) {
                        let group = tmpOptions[key];
                        if(!group) continue;
                        if (!group.hasOwnProperty("selected")) {
                            group.selected = group.items[0];
                        } else {
                            group.selected = "" + group.selected;
                        }

                        this.options.push(group);
                    }
                }
            },
            loadStock(stock) {
                this.localStock = stock;
                this.update();
            },
            getSelectedOptions() {
                var items = [];

                for(let key in this.options) {
                    items.push(this.options[key].name + ": " + this.options[key].selected);
                }

                //console.log("Options Count: " + items.length);

                return items.length > 0 ? " *** Options *** " + items.join(", ") : "";
            },
            setSelectedItemInGroup(args) {
                this.$set(this.options[this.options.findIndex(obj => obj.name === args.group.name)], "selected", args.selected);
            },
            buy() {
                if(!$.isNumeric(this.qty)) {
                    this.errors.record({ qty: ["Not a number"] })
                }
                else if (this.qty <= 0 ){
                    this.errors.record({ qty: ["Purchase qty must not be negative!"] })
                }
                else {
                    // Add item to cart
                    let item = new StockItem();
                    item.stockGuid = this.localStock.guid;
                    item.name = this.localStock.stockDescription + this.getSelectedOptions();
                    item.value = Big(this.localStock.accountInc);
                    item.weight = this.localStock.boxWeight;
                    item.Qty = this.qty;

                    this.cart.addItem('stockItem', '' + this.localStock.guid, item);
                    this.$emit("added-to-cart");
                    push.success( this.qty + ' ' + this.localStock.stockDescription + ' added to cart')
                }
            }
        }
    }
</script>

<!--<docs>-->
<!--```-->
<!--<stock-view-control :stock="stockItem"></stock-view-control>-->
<!--```-->
<!--</docs>-->
