<template>
    <div class="container-fluid p-0 h-100" style="z-index: 5">
        <stock-list-item-control v-if="!loading && !hideInList"
                                 :stock="localStock"
                                 @more-info="showStock"
                                 :btn-class="btnClass"
                                 :image-box-class="imageBoxClass"
                                 :info-btn-class="infoBtnClass"
                                 :show-buy-buttons="showBuyButtons"
                                 :show-prices="showPrices"
                                 :show-unit-type="showUnitType">
            <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope || {}" />
            </template>
        </stock-list-item-control>

<!--        This is the stock model-->
        <b-modal ref="stockViewModal1" body-class="p-0" size="lg" :hide-footer="true" :hide-header="true">
            <slot name="modal-body-content">
                <stock-view-control ref="stockViewControl"
                                    :stock="localStock"
                                    :slide-interval="slideInterval"
                                    :btn-class="btnClass"
                                    @added-to-cart="closeModal"
                                    :show-buy-buttons="showBuyButtons"
                                    :show-unit-type="showUnitType"
                                    :show-prices="showPrices">
                    <template v-slot:carousel-header>
                        <div class="d-flex flex-row p-0 m-0 d-block d-lg-none mb-1" style="height: 22px; z-index: 10">
                            <div class="flex-fill text-xs">&nbsp;</div>
                            <button type="button" class="close pe-1 border-0 bg-transparent pb-1" aria-label="Close"
                                    @click="closeModal()">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    </template>
                    <template v-slot:card-header>
                        <div class="container-fluid p-0 m-0 d-none d-lg-block">
                            <span class="text-xs">&nbsp;</span>
                            <button type="button" class="close btn btn-sm btn-outline-secondary position-absolute top-0 end-0 border-top-0 border-right-0 rounded-top-0 rounded-end-0" aria-label="Close"
                                    @click="closeModal()">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    </template>

                    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
                        <slot :name="slot" v-bind="scope || {}" />
                    </template>
                </stock-view-control>
            </slot>
        </b-modal>
    </div>
</template>

<script>

import Stock from "./libraries/jl-data-objects/Stock/Stock";
import StockViewControl from "./StockViewControl.vue";
import StockListItemControl from "./StockListItemControl.vue";
import {BModal} from 'bootstrap-vue-next'

/**
 * The stock item control is used to display a single stock item that can be expanded to show a modal with full
 * details.
 */
export default {
    name: "StockItemControl",
    components: {
      StockListItemControl,
      StockViewControl,
        BModal
    },
    props: {
        imageBoxClass: {type: [String,Array,Object], default: ['w-100'] },
        /**
         * The guid of the stock item that you want to display.
         */
        stockGuid: {type:String},

        /**
         * The interval in milliseconds for the carousel slider.
         */
        slideInterval: {type: String, default: "5000"},

        /**
         * The classes for the buy button.
         */
        btnClass: { type: String, default: "btn-dark border-0 rounded-0"},

        /**
         * The classes for the more info button.
         */
        infoBtnClass: { type: String, default: "btn-dark border border-dark rounded-0"},

        /**
         * The stock item as requested from server.
         *
         * Not required, but if parent has already loaded stock, it may be used to avoid duplicate requests to server.
         */
         stock: {type: Object, default: null},

        /**
         * Show buy buttons
         */
        showBuyButtons: { type: Boolean, default: true },

        /**
         * Show Prices.
         */
        showPrices: { type: Boolean, default: true},

        hideInList: { type: Boolean, default: false},

        returnUrl: {type: String, default: '' },

        showOnLoad: { type: Boolean, default: false },

        jumpToPage: { type: Boolean, default: false },

        showUnitType: { type: Boolean, default: true }
    },
    data() {
        return {
            localStock: new Stock(),
            loading: false
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
            this.loadStock(this.stock);
            return;
        }

        this.loading = true;
        axios.get("/api/v1/public/stocks/" + this.stockGuid).then( response => {
           this.loadStock(response.data);
            this.loading = false;

            if(this.showOnLoad) {
                this.showStock();
            }
        });
    },
    methods: {
        loadStock(stock) {
            this.localStock = new Stock(stock);
        },
        showStock() {
            if(this.jumpToPage) {
                window.location.href = `/stocks/${this.localStock.plu}`
                return;
            }

            this.$refs.stockViewControl.update();
            this.$nextTick(() => {
                history.replaceState({modal: true}, "", "/stocks/" + this.localStock.plu)
                //$(this.$refs.stockViewModal).modal("show");
                //$(this.$refs.stockViewModal.$el).modal("show")
                this.$refs.stockViewModal1.show();
            });
        },
        closeModal() {
            // Close the modal
            //$(this.$refs.stockViewModal).modal("hide");
            this.$refs.stockViewModal1.hide();
            history.replaceState({modal: true}, "", this.returnUrl);
        }
    }
}
</script>

<!--<docs>-->

<!--A Basic stock item control.-->
<!--```-->
<!--<stock-item-control :stock="stockItem"></stock-item-control>-->
<!--```-->

<!--</docs>-->
