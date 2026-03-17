<template>
    <div class="container-fluid redglass-stock-card-list">
        <div class="row">
            <div v-if="showFilters && hasCharacteristicGroups" class="col-12 col-lg-2 px-0 pb-2">
                <stock-characteristic-filter-panel ref="test" :filter="filter" :filterGroupHeaderClass="filterGroupHeaderClass" @filter-changed="updateFilter" @no-characteristic-groups="hasCharacteristicGroups = false"></stock-characteristic-filter-panel>
            </div>
            <div class="col">
                <div class="input-group pb-1">
                    <input type="text" id="query" name="query" class="form-control" v-model="search" @keypress="searchFind" placeholder="Search"/>
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" @click="asyncLoad">Find</button>
                    </div>
                </div>

                <div :class="'row row-cols-1 row-cols-sm-' + columnsSm + ' row-cols-md-' + columnsMd">
                    <div v-for="stock in this.asyncPage.data" :key="stock.guid" class="col py-1">
                        <stock-item-control :show-unit-type="showUnitType" :image-box-class="imageBoxClass" :jump-to-page="jumpToPage" :stock="stock" :show-buy-buttons="showBuyButtons" :show-prices="showPrices" :return-url="returnUrl">
                            <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
                                <slot :name="slot" v-bind="scope || {}" />
                            </template>
                        </stock-item-control>
                    </div>
                </div>

                <pagination :data="asyncPage" v-on:pagination-change-page="asyncLoad" :limit="2" align="center" size="small"></pagination>
            </div>
        </div>

        <stock-item-control :show-unit-type="showUnitType" :image-box-class="imageBoxClass" ref="stockItem" :jump-to-page="jumpToPage" :stock="stock" :hide-in-list="true" :show-buy-buttons="showBuyButtons" :show-prices="showPrices">
            <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope || {}" />
            </template>
        </stock-item-control>
    </div>
</template>

<script>
import {Bootstrap4Pagination as Pagination} from 'laravel-vue-pagination'
import Stock from "./libraries/jl-data-objects/Stock/Stock";
import StockCharacteristicFilterPanel from "./StockCharacteristicFilterPanel.vue";

/**
 * This will display a card list of stock.
 */
export default {
    name: "StockCardList",
    components: {
        Pagination,
        StockCharacteristicFilterPanel
    },
    props: {
        imageBoxClass: {type: [String,Array,Object], default: ['w-100'] },

        /**
         * The class of the card header for each stock characteristics filter group
         **/
        filterGroupHeaderClass: {type: String, default:""},

        /**
         * The number of columns to show
         */
        columnsSm: {type:Number, default: 2},

        /**
         * The number of columns to show
         */
        columnsMd: {type:Number, default: 4},

        /**
         * Any filter conditions.
         */
        filter: {type: String, default: ''},

        /**
         * This is used if you want an initial search string.
         */
        query: { type: String, default: '' },

        /**
         * This is the number of rows in the display.
         */
        limitRows: { type: Number, default: 4 },

        /**
         * Show the filter list.
         */
        showFilters: { type: Boolean, default: true},

        /**
         * Show buy buttons
         */
        showBuyButtons: { type: Boolean, default: true },

        /**
         * Show Prices.
         */
        showPrices: { type: Boolean, default: true},

        showStockKey: { type: String, default: undefined },

        returnUrl: {type: String, default: '' },

        data: { type: Object, default: undefined },

        jumpToPage: { type: Boolean, default: false },

        showUnitType: { type: Boolean, default: true }
    },
    data() {
        return {
            errorLoading: false,
            loading: false,
            reverse: false,
            sortColumn: "",
            search: "",
            asyncPage: {},
            asyncUrl: "/api/v1/public/stocks",
            filters: "",
            hasCharacteristicGroups: true,
            stock: new Stock(),
            searchStockKey: undefined
        }
    },
    created() {
        this.search = this.query;
        this.searchStockKey = this.showStockKey;
        this.updateFilter();
    },
    mounted() {
        if(this.searchStockKey && this.stock) {
            this.$refs.stockItem.showStock();
            this.searchStockKey = undefined;
            this.$emit('page-loaded', this.asyncPage);
        }
    },
    methods: {
        searchFind(e) {
            let code = (e.keyCode ? e.keyCode : e.which);
            if(code === 13) {
                this.asyncLoad();
            }
        },
        updateFilter(val) {
            if(!this.filter || this.filter === "") {
                this.filters = val;
            } else if (!val || val === "") {
                this.filters = this.filter;
            } else {
                this.filters = this.filter.length + "," + val;
            }

            this.asyncLoad();
        },
        asyncLoad(page, withLoading = true) {
            var limit = this.limitRows * this.columnsMd;
            this.errorLoading = false;

            if(!this.asyncUrl || this.asyncUrl === "")
            {
                return;
            }

            if (typeof page === 'undefined' || page == null) {
                if(this.asyncPage.hasOwnProperty("current_page")) {
                    page = this.asyncPage.current_page;
                } else {
                    page = 1;
                }
            }

            if(this.asyncPage.hasOwnProperty("per_page")) {
                limit = this.asyncPage.per_page;
            }

            var order = '';
            if(this.sortColumn && this.sortColumn !== '') {
                order = "&sc=" + this.sortColumn + "&d=" + (this.reverse ? "up" : "down");
            }

            var searchString = '';
            if(this.search && this.search !== ''){
                searchString = "&s=" + this.search.toLowerCase().replace(/ /g, '+');
            }

            var tmpFilter = '';
            if(this.filters && this.filters !== '') {
                tmpFilter = "&f=" + this.filters;
            }

            if(withLoading) {
                this.loading = true;
            }

            if(this.searchStockKey && this.data) {
                //console.log(this.data)
                this.localSelected = this.data;
                this.stock = new Stock(this.data)
                this.asyncPage = { current_page:1, to: 1, total: 1, from: 1, last_page: 1, data: [this.stock] } ;
                this.loading = false;
                return;
            }

            // Make a request with the limit set.
            //console.log(this.asyncUrl + '?page=' + page + order + searchString + tmpFilter + '&per_page=' + limit);
            axios.get(this.asyncUrl + '?page=' + page + order + searchString + tmpFilter + '&per_page=' + limit).then( response => {
                if(response.data.hasOwnProperty("data")) {
                    this.localSelected = response.data.data.find(obj => obj[this.trackBy] === this.selectedId);
                }

                console.log(response.data)
                this.asyncPage = response.data;
                this.asyncPage.data = response.data.data.map( record => new Stock(record) );

                this.$emit('page-loaded', this.asyncPage);

                if(this.searchStockKey) {
                    this.stock = this.asyncPage.data.find(obj => obj.guid === this.searchStockKey);
                    if(this.stock) {
                        this.$refs.stockItem.showStock();
                    }

                    this.searchStockKey = undefined;
                }

                this.loading = false;
            }).catch( error => {
                console.log(error);

                this.errorMsg = error.message;
                this.loading = false;
                this.errorLoading = true;
            });
        },
    }
}
</script>
