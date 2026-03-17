<template>
    <div class="container" style="z-index: 5">
            <div :id="'carousel' + name" class="carousel slide" data-bs-ride="carousel" style="z-index: 5" :data-bs-interval="slideInterval">
                <div class="carousel-inner">
                    <div v-for="( group, index ) in stockItemsGrouped" :key="index" :class="'carousel-item' + (index === 0 ? ' active' : '')">
                        <div class="row bg-transparent">
                            <div v-for="(stock, i) in group.items" :key="'st_' + i" class="col">
                                <stock-list-item-control :show-unit-type="showUnitType" :image-box-class="imageBoxClass" :href="'/stocks/' + stock.plu" v-if="stock !== null" class="bg-white h-100" :stock="stock" @more-info="showStockModal(stock)" :btn-class="btnClass" :info-btn-class="infoBtnClass"></stock-list-item-control>
                            </div>
                        </div>
                    </div>
                </div>

                <a class="carousel-control-prev w-auto" :href="'#carousel' + name" role="button" data-bs-slide="prev" style="z-index: 15">
                    <vue-feather type="chevron-left" stroke-width="3" class="chevron"></vue-feather>
                    <span class="visually-hidden">Previous</span>
                </a>
                <a class="carousel-control-next w-auto" :href="'#carousel' + name" role="button" data-bs-slide="next"  style="z-index: 15">
                    <vue-feather type="chevron-right" stroke-width="3" class="chevron"></vue-feather>
                    <span class="visually-hidden">Next</span>
                </a>
            </div>

        <b-modal ref="stockViewModal1" body-class="p-0" size="lg" :hide-footer="true" :hide-header="true">
            <slot name="modal-body-content">
                <stock-view-control ref="stockViewControl"
                                    :stock="modalStockItem"
                                    :slide-interval="slideInterval"
                                    :btn-class="btnClass"
                                    @added-to-cart="closeModal"
                                    :show-unit-type="showUnitType">
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

<!--        The stock item in a modal-->
<!--        <div class="modal fade" ref="stockViewModal" tabindex="-1" role="dialog">-->
<!--            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">-->
<!--                <div class="modal-content rounded-0">-->
<!--                    <div class="modal-body p-0">-->
<!--                        <slot name="modal-body-content">-->
<!--                            <stock-view-control-->
<!--                                :stock="modalStockItem"-->
<!--                                :slide-interval="slideInterval"-->
<!--                                :btn-class="btnClass"-->
<!--                                :show-unit-type="showUnitType"-->
<!--                                @added-to-cart="closeStockModal">-->
<!--                                <template v-slot:carousel-header>-->
<!--                                    <div class="p-0 m-0 d-block d-lg-none"  style="border-color: white">-->
<!--                                        <span class="text-xs">&nbsp;</span>-->
<!--                                        <button type="button" class="close btn btn-sm btn-outline-secondary position-absolute top-0 end-0 border-top-0 border-right-0 rounded-top-0 rounded-end-0" aria-label="Close"-->
<!--                                                @click="closeStockModal()">-->
<!--                                            <span aria-hidden="true">&times;</span>-->
<!--                                        </button>-->
<!--                                    </div>-->
<!--                                </template>-->
<!--                                <template v-slot:card-header>-->
<!--                                    <div class="p-0 m-0 d-none d-lg-inline"  style="border-color: white">-->
<!--                                        <span class="text-xs">&nbsp;</span>-->
<!--                                        <button type="button" class="close btn btn-sm btn-outline-secondary position-absolute top-0 end-0 border-top-0 border-right-0 rounded-top-0 rounded-end-0" aria-label="Close"-->
<!--                                                @click="closeStockModal()">-->
<!--                                            <span aria-hidden="true">&times;</span>-->
<!--                                        </button>-->
<!--                                    </div>-->
<!--                                </template>-->
<!--                            </stock-view-control>-->
<!--                        </slot>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
    </div>
</template>

<script>
import Stock from "./libraries/jl-data-objects/Stock/Stock";
import StockViewControl from "./StockViewControl.vue";
import {BModal} from "bootstrap-vue-next";

export default {
    name: "StockCarousel",
    components: {
        BModal,
        StockViewControl
    },
    props: {
        name: { type: String, default: "StockCarousel" },
        itemsOnPage: { type: Number, default: 1 },
        stockGroups: { type: Array, default: () => [] },
        stockPlus: { type: Array, default: () => [] },
        useSpecials: { type: Boolean, default: false },
        slideInterval: {type: String, default: "5000"},
        imageBoxClass: {type: [String,Array,Object], default: ['w-100'] },
        btnClass: { type: String, default: "btn-dark border-0 rounded-0"},

        infoBtnClass: { type: String, default: "btn-dark border-0 rounded-0"},

        returnUrl: {type: String, default: '' },

        showUnitType: { type: Boolean, default: true }
    },
    data() {
      return {
          stockItems: [],
          stockItemsGrouped: [],
          loading: false,
          modalStockItem: new Stock()
      }
    },
    mounted() {
        // Lets load the stock items
        // If special
        if(this.useSpecials) {
            this.loading = true;
            axios.get("/api/v1/public/stocks/on-special").then( response => {
                this.loadStockItems(response.data)
                this.loading = false;
            });

            return;
        }

        // If Stock Groups.
        if(this.stockGroups.length > 0) {
            this.loading = true;
            axios.get("/api/v1/public/stocks/by-stock-groups/" + this.stockGroups.join(',')).then( response => {
                this.loadStockItems(response.data)
                this.loading = false;
            });

            return;
        }

        // If stock plu's
        this.loading = true;
        axios.get("/api/v1/public/stocks/by-stocks/" + this.stockPlus.join(',')).then( response => {
            this.loadStockItems(response.data)
            this.loading = false;
        });
    },
    methods: {
        loadStockItems(items) {
            console.log(items);
            var group = { items: [] };

            var index = 0;
            for(let key in items) {
                if(index % this.itemsOnPage === 0) {
                    group = { items: [] };
                    this.stockItemsGrouped.push(group);
                }

                group.items.push(new Stock(items[key]))
                index++;
            }

            var finalIndex = index;

            while(index % this.itemsOnPage !== 0) {
                 if(items.length > this.itemsOnPage) {
                    group.items.push(new Stock(items[index - finalIndex]))
                 } else {
                     group.items.push(null);
                 }

                index++;
            }
        },
        showStockModal(item) {
            this.modalStockItem = item;
            this.$nextTick(() => {
                history.replaceState({modal: true}, "", "/stocks/" + this.modalStockItem.plu)
                this.$refs.stockViewModal1.show();
            });
        },
        closeModal() {
            this.$refs.stockViewModal1.hide();
            history.replaceState({modal: true}, "", this.returnUrl);
        }
    }
}
</script>

<style scoped>
.chevron {
    color: gray;
    opacity: 0.5;
}
</style>
