<template>
    <div class="container p-1">
        <div class="card">
            <div class="card-header p-1">Requested Coverage</div>
            <div class="card-body p-1">
            <div class="small text-secondary text-end" v-if="stock.unitType.hasWastage">{{ stock.unitType ? stock.unitType.wastageTitle : 'Wastage' }} </div>
            <div class="row g-1">
                <div class="form-group col-12"
                     :class="{'col-lg-5': stock.unitType.hasWastage, 'col-lg-6': !stock.unitType.hasWastage}">
                    <div class="input-group input-group-sm w-100">
                        <input class="form-control" style="text-align:right;" pattern="[0-9]*" autocomplete="off"
                               v-model="lengthCoverageQty"/>
                        <span class="input-group-text">Lenght (m)</span>
                    </div>
                </div>

                <div class="form-group col-12"
                     :class="{'col-lg-5': stock.unitType.hasWastage, 'col-lg-6': !stock.unitType.hasWastage}">
                    <div class="input-group input-group-sm w-100">
                        <input class="form-control" style="text-align:right;" pattern="[0-9]*" autocomplete="off"
                               v-model="widthCoverageQty"/>
                        <span class="input-group-text">Width (m)</span>
                    </div>
                </div>

                <div class="form-group col-12 col-lg-2" v-if="stock.unitType?.hasWastage">
                    <div class="input-group input-group-sm w-100">
                        <input class="form-control"
                               style="text-align:right;"
                               pattern="[0-9]*"
                               autocomplete="off"
                               v-model="wastagePercentage"/>
                        <span class="input-group-text">%</span>
                    </div>
                </div>
            </div>

            <div class="p-0 m-0 pt-1">
                <div class="input-group input-group-sm">
                    <input class="form-control" style="text-align:right;" pattern="[0-9]*" autocomplete="off"
                           v-model="surfaceAreaQty"/>
                    <span class="input-group-text">Area (m<sup>2</sup>)</span>
                </div>
            </div>
            </div>
        </div>

        <div class="row g-1 pt-1" v-if="stock.boxesPerPallet > 0">
            <div class="form-group col-12 pe-lg-1 col-lg-6">
                <div class="input-group input-group-sm w-100">
                    <input class="form-control" style="text-align:right;" pattern="[0-9]*" autocomplete="off"
                           v-model="pallets"/>
                    <span class="input-group-text">{{ stock.unitType ? stock.unitType.palletName : 'Pallets' }}</span>
                </div>
            </div>

            <div class="form-group col-12 ps-lg-1 col-lg-6">
                <div class="input-group input-group-sm w-100">
                    <input class="form-control" style="text-align:right;" pattern="[0-9]*" autocomplete="off"
                           v-model="remainder"/>
                    <span class="input-group-text">{{ stock.unitType ? stock.unitType.name : 'Item' }}</span>
                </div>
            </div>
        </div>

        <div class="small text-secondary text-end pt-1" v-if="stock.boxesPerPallet > 0">{{ stock.boxesPerPallet }} {{ stock.unitType ? stock.unitType.name : 'Item' }}(s) /
            {{ stock.unitType ? stock.unitType.palletName : 'Pallets' }}
        </div>
        <div class="small text-secondary text-end" v-if="stock.qtyInBox > 0">{{ stock.qtyInBox }} {{ stock.unitType ? stock.unitType.piecesName : "Pieces" }} /
            {{ stock.unitType ? stock.unitType.name : 'Item' }}
        </div>
        <div class="small text-secondary text-end" v-if="stock.unitType.hasWastage">Coverage:
            {{ surfaceAreaWithWastage }} <span>m<sup>2</sup></span></div>
        <div class="small text-secondary text-end" v-if="stock.qtyInBox > 0">Total {{ stock.unitType ? stock.unitType.piecesName : "Pieces" }}:
            {{ this.qty * stock.qtyInBox }} {{ stock.unitType ? stock.unitType.piecesName : "Pieces" }}
        </div>
    </div>
    <!--    <div class="alert alert-primary" role="alert">-->
    <!--        This is the vue. :)-->
    <!--    </div>-->
</template>

<script>
import Stock from "./libraries/jl-data-objects/Stock/Stock";
import Big from 'big.js'

export default {
    name: "SurfaceAreaCalculator",
    props: {
        stock: {type: Object},
        qty: {type: [Number, String], required: true},
    },
    data() {
        return {
            /**
             * Calculator properties
             */
            surfaceAreaQty: 0,
            lengthCoverageQty: 0,
            widthCoverageQty: 0,
            pallets: 0,
            //remainder: 0,
        };
    },
    computed: {
        wastagePercentage: {
            get: function () {
                return (this.stock.unitType.wastage * 100).toFixed(1);
            },

            set: function (value) {
                if (value <= 0) {
                    this.stock.unitType.wastage = 0;
                    this.updateQty(this.surfaceAreaQty);
                    return;
                }

                this.stock.unitType.wastage = value / 100;

                this.updateQty(this.surfaceAreaQty);
                //this.surfaceAreaQty = Number(new Big(value).div(this.stock.surfaceArea).mul(this.wastageCalculated).round(0, 3));
            }
        },
        wastageCalculated: function () {
            return new Big(this.stock.unitType.wastage).add(1).toNumber();
        },
        surfaceAreaWithWastage: function () {
            return (new Big(this.qty).mul(this.stock.surfaceArea).round(2, 2)).toNumber()
        },
        remainder: {
            get: function () {
                return this.qty % this.stock.boxesPerPallet;
            },
            set: function (val) {
                if(val >= this.stock.boxesPerPallet) {
                    this.$emit("qty-updated",  val);
                } else {
                    this.$emit("qty-updated",  Number(this.pallets) * Number(this.stock.boxesPerPallet) + Number(val));
                }
            }
        }
    },
    watch: {
        qty: function (val) {
            console.log("Qty: " + val);
            this.pallets = Math.floor(val / this.stock.boxesPerPallet)
            //this.remainder = val % this.stock.boxesPerPallet
        },

        pallets: function (val) {
            this.$emit("qty-updated", (val * this.stock.boxesPerPallet) + this.remainder);
        },

        /**
         * Calculate the surfaceAreaQty on a change of widthCoverageQty
         * @param val
         */
        widthCoverageQty: function (val) {
            if (!this.lengthCoverageQty || this.lengthCoverageQty === 0 || !val) {
                console.log("Val: " + val + " WC: " + this.stock.widthCoverage + " LC: " + this.lengthCoverageQty);
                // this.qty = Number(new Big(val).div(this.stock.widthCoverage).round(0, 3));
                return;
            }

            this.surfaceAreaQty = new Big(val).mul(this.lengthCoverageQty).round(2, 2);
        },

        /**
         * Calculate the surfaceAreaQty on a change of widthCoverageQty
         * @param val
         */
        lengthCoverageQty: function (val) {
            console.log("Val: " + val + " WC: " + this.stock.lengthCoverage + " LC: " + this.lengthCoverageQty);
            if (!this.widthCoverageQty || this.widthCoverageQty === 0 || !val) {
                //this.qty = Number(new Big(val).div(this.stock.lengthCoverage).round(0, 3));
                // breakpoint james
                return;
            }

            this.surfaceAreaQty = new Big(val).mul(this.widthCoverageQty).round(2, 2);
        },

        /**
         * Calculate the surfaceAreaQty on a change of surfaceAreaQty
         * @param val
         */
        surfaceAreaQty: function (val) {
            // Create the qty from the surface area and round up to whole qty.
            this.updateQty(val)
        }
    },
    methods: {
        updateQty: function (newQty) {
            let qty = Number(new Big(newQty).div(this.stock.surfaceArea).mul(this.wastageCalculated).round(0, 3));
            this.$emit("qty-updated", qty);
        }
    }
}
</script>
