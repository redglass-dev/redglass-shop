<template>
    <div class="container-fluid">
        <div :class="'row ' + rowClass" :style="rowStyle">
<!--            Images-->
            <div v-if="hasThumbnail" :class="'col-12 col-md-' + imageCol + ' my-auto text-center'" :style="'min-height: ' + minHeight + 'px;'" @click="showModal()">
                <div :class="'col ' + imageBoxClass" :style="imageBoxStyle">
                    <img :class="'img-fluid ' + imageClass" :style="'height: 100%; width: auto;'" :src="thumbnail"/>
                </div>
            </div>

<!--            Description-->
            <div :class="'col-12 col-md-' + detailCol() + ' my-auto'" @click="showModal()">
                <div :class="'col ' + boxClass" :style="boxStyle">
                    <h5>{{ stockName }}<span v-if="showPlu"> ({{ stockPlu }})</span></h5>

                    <p><span v-html="shortDescription"></span></p>
                </div>
            </div>

<!--            Buy Buttons-->
            <div class="col-12 col-md-2 my-auto">
                <div v-if="(showPrice || showBuyButton)" :class="'col ' + boxClass" :style="boxStyle">
                    <label v-if="showPrice" for="qty"><strong>${{ price }}</strong>  <slot name="list-price-label"><sub class="text-secondary">(inc)</sub></slot></label>
                    <div v-if="showBuyButton" class="input-group">
                        <input :class="'form-control form-control-sm' + (errors.has('qty') ? ' is-invalid' : '' )" id="qty" pattern="[0-9]*" name="qty" v-model="qty" autocomplete="off" @focus="selectText($event.target)" style="text-align: right;" />
                        <div class="input-group-append">
                            <button v-if="qty>0" type="button" placeholder="1" class="btn btn-sm btn-success" @click="buy">Buy</button>
                            <button v-else type="button" class="btn btn-sm btn-success" disabled>Buy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

<!--        Modal-->
        <div class="modal" :id="'stockItemModal' + stockGuid" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <slot name="modal-header">
                        <div v-if="images.length > 0" id="carouselExampleSlidesOnly" :class="'modal-header ' + headerClass" :style="'height: ' + headerImageHeight + 'px; background: url(' + images[0] + ') no-repeat center center; background-size: cover; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover;'">
                            <h5 :class="'modal-title ' + titleClass" :style="titleStyle"><span v-if="!titleInBody">{{ stockName }}<span v-if="showPlu"> {{ stockPlu }}</span></span></h5>
                            <slot name="close-button">
                                <button type="button" class="btn btn-xs btn-outline-danger pb-1" style="padding-top: 10px;" data-dismiss="modal" aria-label="Close">
                                    <vue-feather type="x" size="1.2em"></vue-feather>
                                </button>
                            </slot>
                        </div>
                        <div v-else :class="'modal-header ' + headerClass" :style="headerStyle">
                            <h5 :class="'modal-title ' + titleClass" style="text-shadow: 1px 1px #f0f0f0; font-weight: bold; font-size: 1.6em;">{{ stockName }}<span v-if="showPlu"> {{ stockPlu }}</span></h5>
                            <slot name="close-button-no-image">
                                <button type="button" class="btn btn-xs btn-outline-danger" data-dismiss="modal" aria-label="Close">
                                    <vue-feather type="x" size="1.2em"></vue-feather>
                                </button>
                            </slot>
                        </div>
                    </slot>

                    <div class="modal-body">
                        <slot name="modal-body-content">
                            <h5 v-if="(titleInBody && images.length > 0)" :class="'modal-title ' + titleClass" :style="titleStyle">{{ stockName }}<span v-if="showPlu"> {{ stockPlu }}</span></h5>
                            <p><span v-html="stockDescription"></span></p>
                        </slot>
                    </div>
                    <div class="modal-footer text-end pb-0">
                        <div v-if="!loading" class="col text-end text-nowrap">
                            <div class="form-row pb-0">
                                <div class="form-group col-8 text-end">
                                    <span v-if="showPrice" class="pe-2"><strong>${{ total }}</strong> <slot name="modal-price-label"><sub class="text-secondary">(total)</sub></slot></span>
                                </div>

    <!--                            <form class="form-inline" @keydown="errors.clear($event.target.name)">-->
                                <div class="form-group col-4 text-end">
    <!--                                <label v-if="showPrice" for="modal_qty" class="pe-2"><strong>${{ price }}</strong> <sub class="text-secondary">(inc)</sub></label>-->
                                    <div v-if="showBuyButton" class="input-group input-group-sm">
                                        <input :class="'form-control form-control-sm' + (errors.has('qty') ? ' is-invalid' : '' )" id="modal_qty" pattern="[0-9]*" name="modal_qty"  v-model="qty" autocomplete="off" @focus="selectText($event.target)" />
                                        <div class="input-group-append">
                                            <button v-if="qty>0" type="button" class="btn btn-sm btn-success" @click="buy" data-dismiss="modal">Buy</button>
                                            <button v-else type="button" class="btn btn-sm btn-success" disabled>Buy</button>
                                        </div>
                                    </div>
                                </div>
    <!--                            </form>-->
                            </div>
                        </div>
                        <span v-else><vue-feather type="loader" animation="spin" animation-speed="fast" size="1.2em"></vue-feather></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { FormErrors } from './libraries/jl-general/helpers/Form'
    import { StockItem } from '../Cart';
    import Big from "big.js"
    import {mapState} from 'pinia'
    import {useCartStore}  from '../stores/cartStore'
    import {push} from "notivue";


    /**
     * The old stock item control.
     *
     * @deprecated
     */
    export default {
        name: "StockItem",
        props: {
            stockGuid: '',
            price: 0.00,
            stockName: "",
            stockDescription: "",
            stockPlu: "",
            weight: 0,
            descriptionLength: { default: 85 },
            minHeight: { default: 55 },
            thumbnail: { type: String, default: '' },
            showPrice: true,
            showBuyButton: true,
            showPlu: true,
            allowPopup: { type: Boolean, default: true },
            images: { type: Array, default: []},

            /**
             * Modal styling properties
             */
            headerClass: "",
            headerStyle: "",
            headerImageHeight: { type: Number, default: 220 },
            titleClass: "",
            titleStyle: { type: String, default: "text-shadow: 1px 1px #f0f0f0; font-weight: bold; font-size: 1.6em;"},
            titleInBody: { type: Boolean, default: false },

            /**
             * Row styling properties
             */
            rowStyle: { type: String, default: "background: white; border: 1px solid lightgrey;" },
            rowClass: { type: String, default: "rounded" },
            boxStyle: { type: String, default: "background: white" },
            boxClass: { type: String, default: "rounded p-3" },
            imageClass: { type: String, default: "rounded" },
            imageBoxStyle: { type: String, default: "background: white"  },
            imageBoxClass: { type: String, default: "rounded p-3" },
            imageCol: { type: Number, default: 2 },
            detailCol: { type: Function, default: function () { return this.hasThumbnail ? 10 - this.imageCol : 10 }}


        },
        computed: {
            ...mapState(useCartStore, {cart: "cart"}),
            shortDescription: function () {
                return this.stockDescription;
            },
            // detailCol: function () {
            //     console.log(this.hasThumbnail ? 10 - this.imageCol : 10);
            //     return this.hasThumbnail ? 10 - this.imageCol : 10;
            // },
            hasThumbnail: function() {
                return this.thumbnail !== "";
            },
            total: function() {
                return new Number(new Big(this.price).mul(this.qty).round(2, 2));
            },
        },
        data() {
            return {
                qty: 1,
                loading: false,
                errors: new FormErrors()
            };
        },
        methods: {
            // selectText(id) {
            //     // select Text
            //     if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
            //         setTimeout(function () {
            //             id.target.setSelectionRange(0, 9999);
            //         }, 1);
            //     } else {
            //         id.target.select();
            //     }
            // },
            showModal() {
                if(this.allowPopup === true) {
                    $('#stockItemModal' + this.stockGuid).modal().show();
                }
            },
            buy() {
                if(!$.isNumeric(this.qty)) {
                    this.errors.record({ qty: ["Not a number"] })
                }
                else if (this.qty <= 0 ){
                    this.errors.record({ qty: ["Purchase qty must not be negative!"] })
                }
                else {
                    let item = new StockItem();
                    item.stockGuid = this.stockGuid;
                    item.name = this.stockName;
                    item.name = this.stockName;
                    item.value = Big(this.price);
                    item.weight = this.weight;
                    item.Qty = this.qty;
                   this.cart.addItem('stockItem', '' + this.stockGuid, item);
                    push.success( this.qty + ' ' + this.stockName + ' added to cart')
                }
            }
        }
    }
</script>

<style scoped>

</style>
