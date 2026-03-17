<template>
    <div class="container-fluid p-0 m-0">
        <div :class="(useCard ? 'card ' : '') + 'mb-1'">
            <div :class="(useCard ? 'card-body' : '')">
                <div class="form-group-sm">
                    <label for="name" class="control-label-sm border-bottom">Name</label>
                    <input name="name" id="name" type="text" class="form-input" @change="save" v-model="form.name" />
                </div>
                <div class="form-group-sm">
                    <label for="memo" class="control-label-sm border-bottom">Memo</label>
                    <input name="memo" id="memo" type="text" class="form-input" @change="save" v-model="form.memo" />
                </div>
            </div>
        </div>

        <div class="row w-100 p-0 m-0 pt-1 pb-1">
            <div class="col-12 p-0 m-0 text-end">
                <button type="button" class="btn btn-sm btn-warning" :disabled="!allowExport" @click="clear">Clear</button>
                <button type="button" class="btn btn-sm btn-warning" @click="useDefaults">Default Qty's</button>
                <button type="button" class="btn btn-sm btn-success" @click="addToCart">Add to Cart</button>
            </div>
        </div>

<!--                <data-grid ref="detailsGrid"-->
<!--                    :columns="columns"-->
<!--                    :records="details"-->
<!--                    v-on:row-clicked="showDetail"-->
<!--                    @new-row="newDetail"-->
<!--                    @delete-row="deleteDetail"-->
<!--                    :totalRowLimit="250"-->
<!--                    :use-card="false">-->
<!--                </data-grid>-->

        <data-grid ref="detailsGrid"
                   class="rg-sales-template-details"
                   trackBy="guid"
                   :columns="columns"
                   :records="details"
                   v-on:row-clicked="showDetail"
                   @new-row="newDetail"
                   @delete-row="deleteDetail"
                   :totalRowLimit="250"
                   :use-card="useCard"
                   :dynamic-height="true"
                   :draggable="true"
                   row-index-field="itemNum"
                   @row-changed="updateDetail"
                   :show-running-totals="true"
                   :update-settings="saveDetailGridSettings"
                   :allow-row-focus="false"
                   :settings="detailGridSettings">
        </data-grid>


        <div :class="(useCard ? 'card' : '')">
            <div :class="(useCard ? 'card-body ' : '') + 'm-0 text-end'">
                Total: {{ totalValue }}
            </div>
        </div>

        <div class="row w-100 p-0 m-0 pt-1 pb-5">
            <div class="col-12 p-0 m-0 text-end">
                <button type="button" class="btn btn-sm btn-warning" :disabled="!allowExport" @click="clear">Clear</button>
                <button type="button" class="btn btn-sm btn-warning" @click="useDefaults">Default Qty's</button>
                <button type="button" class="btn btn-sm btn-success" @click="addToCart">Add to Cart</button>
            </div>
        </div>

        <sales-template-detail-dialog ref="editDialog" id="editDialog" :detail="selectedDetail" @delete-row="deleteDetail" @on-saved="detailSaved"></sales-template-detail-dialog>

        <delete-confirmation-dialog
            ref="deleteWarning"
            id="deleteWarning"
            :is-deleting="isDeleting"
            title="Delete Sales Template Detail"
            :message="'Are you sure you want to delete the ' + currentDescription + ' item?'"
            @confirm-delete="runDelete">
        </delete-confirmation-dialog>
    </div>
</template>

<script>

import DataGrid from './libraries/rg-vue-grid/grid/DataGrid.vue'
import Form from './libraries/jl-general/helpers/Form'
import DeleteConfirmationDialog from './libraries/jl-general/DeleteConfirmationDialog.vue'
import SalesTemplate from './libraries/jl-data-objects/Sales/SalesTemplate'
import SalesTemplateDetail from './libraries/jl-data-objects/Sales/SalesTemplateDetail'
import SalesTemplateDetailDialog from "./SalesTemplateDetailDialog.vue"
import Formatter from './libraries/jl-general/helpers/Formatter'
import Big from 'big.js'
import {push} from "notivue";

export default {
    name: "SalesTemplateForm",
    components: {
        DeleteConfirmationDialog, DataGrid, SalesTemplateDetailDialog
    },
    props: {
        salesTemplateGuid: { type: String, default: "" },
        template: { type: SalesTemplate, default: null },
        useCard: { type: Boolean, default: true },
    },
    data() {
        return {
            currentTemplate: null,
            form: new Form(),
            details: [],
            selectedDetail: null,
            isDeleting: false,
            formatter: new Formatter(),
            columns: [
                {field: "description", width: 7, format: {type: "string"}, title: "Description", class: ""},
                {field: "exportQty", width: 1, format: {type: "number"}, title: "To Cart", class: "", editor: true, editInputClass: 'grid-form-input'},
                {field: "qty", width: 1, format: { type: "number" }, title: "Default", class: "text-end", runningTotal: { functionType: "sum", format: "number" } },
                {field: "unitTax", width: 1, format: "currency", title: "Tax", class: 'text-end d-none d-lg-block' },
                {width: 1, format: {type: "currency"}, formula: "(unitPrice + unitTax)", title: "Price Inc", class: "text-end"},
                {width: 1, format: "currency", formula: "(unitPrice + unitTax) * exportQty", title: "Total", class: 'text-end'},
            ],
            detailGridSettings: { RowOrderChangeable: false }
        }
    },
    mounted() {
        // If we do not have a template then lets create one
        if(this.salesTemplateGuid !== '') {
            axios.get("/api/v1/sales/templates/" + this.salesTemplateGuid).then( response => {
                console.log('response data =');
                console.log(response.data);
                this.currentTemplate = new SalesTemplate(response.data);
                this.form = new Form(this.currentTemplate);
                this.loadDetails();
            });
        }
    },
    beforeMount() {
        let json = JSON.parse(localStorage.getItem('sale-template-details-settings'));
        if(typeof json === 'undefined' || json === null)
            return;

        this.detailGridSettings = json;
    },
    computed: {
        totalValue: function() {
            var total = 0.00;
            for (let key in this.details) {
                total += this.details[key].lineTotalInc;
            }

            return this.formatter.format(total, 'currency');
        },
        currentDescription: function() {
            if(this.selectedDetail) {
                return this.selectedDetail.description;
            }

            return "";
        },
        allowExport() {
            for( let key in this.details) {
                if(this.details[key].exportQty !== 0 && this.details[key].exportQty !== "") {
                    return true;
                }
            }

            return false;
        },
    },
    watch: {
        template: function(newValue) {
            console.log("template changing");
            console.log(newValue);
            if(newValue !== null && (this.currentTemplate === null || this.currentTemplate.guid !== newValue.guid)) {
                console.log("setting template");
                this.currentTemplate = new SalesTemplate(newValue);
                this.form = new Form(this.currentTemplate);
            }

            // Lets get the current details
            this.loadDetails();
        }
    },
    methods: {
        // loadDetails() {
        //     console.log('/api/v1/sales/templates/' + this.currentTemplate.guid + '/details?page=1&limit=1000');
        //     axios.get('/api/v1/sales/templates/' + this.currentTemplate.guid + '/details?page=1&limit=1000').then( response => {
        //         console.log(response.data);
        //         if(response.data) {
        //             this.details = [];
        //             for(let key in response.data) {
        //                 this.details.push(new SalesTemplateDetail(response.data[key]));
        //             }
        //         }
        //     }).catch( error => {
        //     });
        // },

        /**
         * Load template details records.
         */
        loadDetails() {
            this.$refs.detailsGrid.setLoading(true);
            console.log('/api/v1/sales/templates/' + this.currentTemplate.guid + '/details?page=1&limit=1000');
            axios.get('/api/v1/sales/templates/' + this.currentTemplate.guid + '/details?page=1&limit=1000').then(response => {
                console.log(response);
                if(response.data) {
                    this.details = [];
                    for(let key in response.data) {
                        var row = response.data[key];
                        row["exportQty"] = "";
                        this.details.push(new SalesTemplateDetail(response.data[key]));
                    }

                    // Let's sort the rows if they are allowed
                    this.$nextTick(() => {
                        if(this.detailGridSettings.RowOrderChangeable) {
                            this.$refs.detailsGrid.sorter("itemNum", false);
                        }
                    });
                }
                this.$refs.detailsGrid.setLoading(false);
            }).catch( error => {
                this.$refs.detailsGrid.setLoading(false);
            });
        },

        save() {
            //this.$nextTick( function () {
                this.form.put('/api/v1/sales/templates/' + this.currentTemplate.guid, axios).then( response => {
                    console.log(response);
                    this.currentTemplate.update(response.object);
                    this.form = new Form(this.currentTemplate);
                    this.$emit('on-save', this.currentTemplate);
                });
            //});
        },
        showDetail(detail) {
            this.selectedDetail = detail;
            $('#editDialog').modal('show');
        },
        newDetail() {
            let detail = new SalesTemplateDetail();
            detail.setTemplate(this.currentTemplate);
            this.selectedDetail = detail;
            $('#editDialog').modal('show');
        },
        deleteDetail(detail, e) {
             console.log("deleteDetail");
            this.selectedDetail = new SalesTemplateDetail(detail);
            // Let check if we have a key event
            if(e && e.ctrlKey) {
                // fast delete
                this.runDelete()
            } else {
                // slow delete
                this.$refs.deleteWarning.show();
            }
        },
        runDelete() {
            this.isDeleting = true;
            console.log("runDelete");
            let index = this.details.findIndex(option => option.guid === this.selectedDetail.guid);
            if (index < 0) {
                this.isDeleting = false;
                return;
            }

            axios.delete("/api/v1/sales/templates/" + this.currentTemplate.guid + '/details/' + this.selectedDetail.guid).then(response => {
                console.log("Deleting template detail: " + index);
                console.log(response);
                console.log(response.status);
                if (response.status === 200) {
                    console.log("Removing: " + index);
                    this.details.splice(index, 1);
                }

                $('#editDialog').modal('hide');
                this.$refs.deleteWarning.hide();
                this.$emit('details-changed');
                this.isDeleting = false;
            });
        },
        detailSaved(detail) {
            if(detail.hasOwnProperty('guid')) {
                let local = new SalesTemplateDetail(detail);
                let index = this.details.findIndex( item => item['guid'] === local['guid']);
                if(index < 0) {
                    this.details.splice(0, 0, local);
                } else {
                    this.details.splice(index, 1, local);
                    this.$emit('details-changed');
                }

                // Lets make sure the local selected object is set.
                this.selectedDetail = this.details.find(item => item['guid'] === local.guid);
            }
        },

        clear() {
            for (let key in this.details) {
                this.details[key].exportQty = 0;
            }
        },

        useDefaults() {
            for (let key in this.details) {
                this.details[key].exportQty = Number(this.details[key].qty).toFixed(2);
            }
        },

        getDetails() {
            return this.details;
        },

        saveDetailGridSettings(settings) {
            this.detailGridSettings = settings;
            localStorage.setItem('sale-template-details-settings', JSON.stringify(settings));
        },

        /**
         * Update the detail.
         * @param detail
         */
        updateDetail(detail) {
            // Update detail after reorder
            window.axios.put('/api/v2/sales/templates/' + this.current.guid + '/details/' + detail.guid, detail);
        },

        /**
         * Adds the exported qty to cart
         */
        addToCart() {
            var qty = Big(0);
            var message = "";
            var failedItems = [];
            var failedMessage = "";
            for(let key in this.details) {
                try {
                    if(this.details[key].exportQty === "") {
                        continue;
                    }

                    if(isNaN(this.details[key].exportQty)) {
                        failedItems.push(this.details[key]);
                        failedMessage += this.details[key].exportQty + "x " + this.details[key].description + " - To Cart Qty is not a number<br />";
                        continue;
                    }

                    if(this.details[key].exportQty > 0) {
                        var tmpQty = this.details[key].exportQty + "";
                        qty = qty.add(Big(tmpQty.trim()));
                        // Lets add the item to the cart.
                        if(window.Cart.addStockItem(this.details[key].stockGuid,
                            this.details[key].description,
                            this.details[key].exportQty,
                            Big(this.details[key].unitPrice).plus(Big( this.details[key].unitTax)).round(window.unitRound),
                            0.00,
                            false)) {
                            this.details[key].exportQty = "";
                            message += tmpQty + "x " + this.details[key].description + "<br />";
                        } else {
                            failedItems.push(this.details[key]);
                            failedMessage += this.details[key].exportQty + "x " + this.details[key].description + " - To Cart Qty is not a number<br />";
                            console.log("Failed to add item: " + this.details[key].description);
                        }
                    }
                } catch (e) {
                    failedItems.push(this.details[key]);
                    failedMessage += this.details[key].exportQty + "x " + this.details[key].description + " - " + e.message + "<br />";
                }
            }

            window.Cart.save();

            if(message != "") {
                push.success( "<strong>Added " + qty + " item(s) to Cart:</strong><br />" + message)
            }

            console.log(failedMessage);
            if(failedMessage != "") {
                push.success( "<strong>Failed to write to cart the following:</strong><br />" + failedMessage)
            }
        },
    }
}
</script>
