<template>
    <div class="container-fluid">
        <div class="row">
            <div v-for="(stock, key) in records.data" :class="'col-md-' + mdRowSize + ' p-1'" :key="stock.guid">
                <slot v-bind:stock="stock" v-bind:buy="buy" v-bind:getSpecialPrice="getSpecialPrice" v-bind:showBuyButtons="showBuyButtons" v-bind:showPrices="showPrices" name="item">
                    <div class="card h-100">
                        <img v-if="stock.wideImage !== null" class="card-img-top" :src="stock.wideImage.urlLink" />
                        <div class="card-body">
                            <h5 class="card-title">({{ stock.stockPlu }}) {{ stock.stockDescription }}</h5>
                            <p class="card-text">{{ stock.webDescription }}</p>

                            <div class="form-row pb-0">
                                <div class="form-group col-8 text-end">
                                    <span v-if="showPrices" class="pe-2"><strong>${{ getSpecialPrice(stock).toFixed(2) }}</strong> <sub class="text-secondary">(total)</sub></span>
                                </div>
                                <div class="form-group col-4 text-end">
                                    <div v-if="showBuyButtons" class="input-group input-group-sm">
                                        <input :class="'form-control form-control-sm'" pattern="[0-9]*" value="1" :ref="'qty_' + stock.guid" autocomplete="off" @focus="selectText($event.target)" />
                                        <div class="input-group-append">
                                            <button type="button" class="btn btn-sm btn-success" @click="buy(stock)" data-dismiss="modal">Buy</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </slot>
            </div>
        </div>
        <br />
        <pagination v-if="showPaginator" :data="records" v-on:pagination-change-page="loadPage" :limit="limit"></pagination>
    </div>
</template>

<script>
    import {Bootstrap5Pagination as Pagination} from 'laravel-vue-pagination'
    import Stock from './libraries/jl-data-objects/Stock/Stock'
    import { StockItem } from '../Cart';
    import Big from "big.js"
    import {mapState} from 'pinia'
    import {useCartStore}  from '../stores/cartStore'
    import {push} from "notivue";

    export default {
        name: "Specials",
        components: {
            Pagination,
        },
        props: {
            columns: { type: Number, default: 3 },
            limit: { type: Number, default: 9 },
            showPaginator: { type: Boolean, default: true },
            orderBy: { type: String, default: 'stockDescription' },
            sortDirection: { type: String, default: 'up' },
            showBuyButtons: { type: Boolean, default: true },
            showPrices: { type: Boolean, default: true },
            accountGuid: { type: String, default: '' },

            /**
             * Filter description.
             * Use a comma separated list field and value pares separated by a :
             * eg accountGuid:234,isOpen:true
             */
            filters: { type: String, default: '' },
        },
        computed: {
            ...mapState(useCartStore, {cart: "cart"}),
            mdRowSize: {
                get() { return 12 / Number(this.columns); }
            }
        },
        data() {
            return {
                records: {},
                loading: false,
            }
        },
        mounted() {
            this.loadPage(1);
        },
        methods: {

            getSpecialPrice(stock) {
                if(stock.accountInc <= 0) {
                    return stock.specialInc;
                }

                return stock.specialInc < stock.accountInc ? stock.specialInc : stock.accountInc;
            },

            loadPage(page) {
                var tmpFilter = "&f=onSpecial: true";
                var order = '';

                if (typeof page === 'undefined' || page == null) {
                    if(this.records.hasOwnProperty("current_page")) {
                        page = this.records.current_page;
                    } else {
                        page = 1;
                    }
                }

                if(this.filters && this.filters !== '') {
                    tmpFilter = "&f=onSpecial: true, " + this.filters;
                }

                if(this.orderBy !== '') {
                    order = "&sc=" + this.orderBy + "&d=" + this.sortDirection;
                }

                var limit = "&limit=" + this.limit;
                let account = this.accountGuid === '' ? '' : "&account=" + this.accountGuid;

                console.log('api/v1/stocks?page=' + page + order + limit + account + tmpFilter);

                axios.get('api/v1/stocks?page=' + page + order + limit + account + tmpFilter).then( response => {
                    this.records = response.data;
                    console.log(this.records.data);
                    this.records.data = response.data.data.map( record => { return new Stock(record) } );
                    console.log(this.records.data);
                    this.loading = false;
                }).catch( error => {
                    console.log(error);

                    this.errorMsg = error.message;
                    this.loading = false;
                    this.errorLoading = true;
                });
            },
            buy(stock) {
                var qty = $(this.$refs['qty_' + stock.guid]).val();

                if(!$.isNumeric(this.qty)) {
                    qty = 1;
                }

                let item = new StockItem();
                item.stockGuid = stock.guid;
                item.name = stock.stockDescription;
                item.value = Big(this.getSpecialPrice(stock));
                item.weight = stock.boxWeight;
                item.Qty = qty;
                this.cart.addItem('stockItem', '' + item.stockGuid, item);

                push.success(qty + ' ' + item.name+ ' added to cart')
            }
        }
    }
</script>

<style scoped>

</style>
