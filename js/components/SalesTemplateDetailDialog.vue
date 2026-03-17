<template>
    <div class="modal fade" :id="id" tabindex="-1" role="dialog" :aria-labelledby="id + 'Title'" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header p-0 m-0">
                    <h5 class="p-1 m-1 text-start text-nowrap align-top">
                        <span>Sales Template Detail</span>
                    </h5>
                    <div class="w-100 text-end">
                        <div class="btn-group btn-group-xs btn-dialog-toolbar" role="group">
                            <button type="button" class="btn btn-xs btn-outline-danger" @click="close">
                                <vue-feather type="x" size="1em"></vue-feather>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <form name="detail-form" @submit.prevent="onSubmit" @keydown="form.errors.clear($event.target.name)">
                        <div class="form-row">
                            <div class="form-group col">
                                <label for="stockGuid" class="control-label">Stock Item</label>
                                <multiselect v-model="selectedStock"
                                            id="stockGuid"
                                            label="Description"
                                            track-by="guid"
                                            placeholder="Type to search" open-direction="bottom"
                                            :options="stocks"
                                            :searchable="true"
                                            :loading="stockLoading"
                                            :clear-on-select="true"
                                            :close-on-select="true"
                                            :show-no-results="true"
                                            :allow-empty="false"
                                            :internal-search="false"
                                            deselectLabel=""
                                            @search-change="stockSearch"
                                            @select="setStock">
                                    <template slot="singleLabel" slot-scope="{ option }">{{ option.plu }} {{ option.stockDescription }}</template>
                                    <template slot="option" slot-scope="props">
                                        <div class="option__desc p-0">
                                            <span class="option__title">{{ props.option.plu }} </span><br />
                                            <small><span class="text-secondary">{{ props.option.stockDescription }}</span></small>
                                        </div>
                                    </template>
                                    <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
                                </multiselect>
                            </div>
                        </div>

                        <div class="form-row pb-0 mb-0">
                            <div class="form-group col pb-0 mb-0">
                                <label class="control-label">Default Qty</label>
                                <input type="numeric" ref="defaultQty" name="qty" v-model="qty" onfocus="selectText(this)" :allow-negative="allowNegative" :class="'form-control hide-focus-rectangle text-end' + (form.errors.has('qty') ? ' is-invalid': '')" />
                                <small class="form-text text-danger" v-text="form.errors.get('qty')"></small>
                            </div>
                        </div>

<!--                        <div class="form-row">-->
<!--                            <div class="form-group">-->
<!--                                <label for="qty" class="control-label">Default Qty</label>-->
<!--                                <input type="number" :class="'form-control hide-focus-rectangle text-end' + (form.errors.has('qty') ? ' is-invalid': '')" v-model="form.qty" />-->
<!--                                <small class="form-text text-danger" v-text="form.errors.get('qty')"></small>-->
<!--                            </div>-->
<!--                        </div>-->
                    </form>
                </div>

                <div class="modal-footer ps-0">
                    <div class="row w-100">
                        <div class="col-6 text-start ps-0 ml-0">
                            <button type="button" class="btn btn-sm btn-danger" @click="deleteRow"><vue-feather v-if="isDeleting" type="loader" animation="spin" animation-speed="fast" size="1.0em"></vue-feather>Delete</button>
                        </div>
                        <div class="col-6 text-end">
                            <button type="button" class="btn btn-sm btn-secondary" @click="close">Close</button>
                            <button type="button" class="btn btn-sm btn-primary" @click="onSubmit"><vue-feather v-if="isSaving" type="loader" animation="spin" animation-speed="fast" size="1.0em"></vue-feather> Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import Form from './libraries/jl-general/helpers/Form'
import SalesTemplateDetail from './libraries/jl-data-objects/Sales/SalesTemplateDetail'
import Stock from './libraries/jl-data-objects/Stock/Stock'
import { PriceGroup } from './libraries/jl-data-objects/Stock/PriceGroup'
import Big from 'big.js'
import Multiselect from 'vue-multiselect'

export default {
    name: "SalesTemplateDetailDialog",
    components: {
        Multiselect
    },
    props: {
        id: { type: String, required: true },
        detail: { type: Object, default: new SalesTemplateDetail() },
        account: { default: 0 }
    },
    data() {
        return {
            form: new Form({}),
            stockLoading: false,
            isDeleting: false,
            stocks: [],
            currentStock: {},
            isSaving: false
        }
    },
    computed: {
        selectedStock : {
            get () {
                this.currentStock = this.stocks.find(option => option.guid === this.form.stockGuid);
                return this.currentStock;
            },
            set (value) {
                if(value != null) {
                    this.form.stockGuid = value.guid;
                } else {
                    this.form.stockGuid = '';
                }
            }
        },
        lineTotalInc: {
            get() {
                if(this.form.unitPrice === "" || this.form.unitTax === "" || this.form.qty === "") {
                    return 0.00;
                }

                return Number(Big(this.form.unitPrice).plus(this.form.unitTax).times(this.form.qty));
            }
        },
        allowNegative: {
            get() {
                return false;
            }
        },
        qty: {
            get() {
                if(typeof this.form === "undefined" || typeof this.form.qty === 'undefined') {
                    return 0.00;
                }

                return parseFloat(this.form.qty).toFixed(2);
            },
            set(val) {
                if(typeof this.form === "undefined") {
                    return;
                }

                this.form.qty=parseFloat(val);
            }
        }
    },
    watch: {
        detail: function (newValue) {
            if(this.detail != null) {
                this.form = new Form(this.detail);
                this.getStock(this.detail.stockGuid);
            }
        },
    },
    methods: {
        onSubmit() {
            this.isSaving = true;
            var url = '/api/v1/sales/templates/' + this.detail.salesTemplateGuid + '/details';
            var method = 'post';

            if(this.form.guid !== "") {
                url = url + '/' + this.form.guid;
                method = 'put';
            }

            this.form[method](url, axios)
                .then(response => {
                    $('#' + this.id).modal('hide');

                    // Lets add the new item
                    this.detail.update(response.object);
                    this.form = new Form(this.detail);

                    this.isSaving = false;
                    this.$emit('on-saved', this.detail);
                });
        },
        setStock(item) {
            let stock = new Stock(item);
            this.form.description = stock.stockDescription;
            this.form.taxGuid = stock.taxGuid;
            this.form.unitTax = stock.accountTax;
            this.form.unitPrice = stock.accountEx;
            this.form.unitPriceInc = stock.accountInc;
            this.form.locationGuid = stock.defaultLocationGuid;
            this.form.unitCostPrice = stock.costEx;
        },
        stockSearch(query) {
            console.log(query);
            if(query === '') {
                return;
            }

            this.stockLoading = true;
            window.axios.get('/api/v1/stocks/search/' + query + '?limit=50').then( response => {
                this.stocks = response.data.data;
                if(this.currentStock) {
                    this.stocks.splice(0, 0, this.currentStock);
                }
                this.stockLoading = false;
            });
        },
        getStock(id) {
            if(!id || id === '')
                return;

            this.stockLoading = true;
            console.log('/api/v1/stocks/' + id);
            window.axios.get('/api/v1/stocks/' + id).then( response => {
                console.log(response.data);
                this.currentStock = response.data;
                this.stocks = [this.currentStock];
                this.stockLoading = false;
            });
        },
        deleteRow() {
            console.log("Deleting detail");
            this.$emit('delete-row', this.detail);
            console.log("Deleted detail");
        },
        close() {
            $('#' + this.id).modal('hide');
        }
    }
}
</script>

<style>

</style>
