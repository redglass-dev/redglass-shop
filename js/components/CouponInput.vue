<template>
    <div>
        <div v-if='validatedValue===""' class="row px-2" >
<!--        <div>-->
<!--            <label class="control-label">Coupon Code</label>-->
<!--            <input type="text" name="Coupon Code" class="form-control col-10 " placeholder="validatedValue" v-model="localValue" @input="localValueChanged"/>-->
<!--            <input type="text" name="Coupon Code" class="form-control col-10" :placeholder="validatedValue" disabled="true"/>-->
<!--            <button class="col-2 btn-warning" @click="clearCoupon">Remove</button>-->

            <label class="control-label col-12">Coupon Code</label>
            <input type="text" name="Coupon Code" class="form-control col-10" v-model="inputValue"/>
            <button class="col-2 btn-light border-dark p-1" @click="addCoupon">Add</button>
            <small v-if='errorMessage !== ""' class="invalid-feedback">{{errorMessage}}</small>
        </div>
        <div v-else class="row px-2">
<!--        <div>-->
            <label class="control-label col-12">Coupon Code</label>
            <input type="text" name="Coupon Code" class="form-control col-10" :placeholder="validatedValue" disabled="true"/>
            <button class="col-2 btn-warning p-1" @click="clearCoupon">Remove</button>
        </div>
    </div>

</template>

<script>
import Form from './libraries/jl-general/helpers/Form'
import ConfirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate'

export default {
    name: "CouponInput",
    components: {
    },
    props: {
        value: "",
        errors: "ouch - this is wrong",
    },
    data() {
        return {
            inputValue: "",
            validatedValue: "",
            errorMessage: "",
        }
    },
    mounted() {
        this.errorMessage = this.errors;
        this.inputValue = this.value;
        this.validatedValue = this.value;
    },
    //   watch: {
        // localValue: function ( newVal, oldVal ) {
        //     if ( this.validateCoupon( this.localValue ) )
        //     {
        //         console.log("coupon code updated!")
        //
        //         this.validatedValue = newVal;
        //         this.errorMessage = "";
        //
        //         this.emitCouponChanged();
        //     }
        //     else
        //     {
        //         this.validatedValue = oldVal;
        //         this.errorMessage = "This coupon is invalid or already redeemed!";
        //     }
        //     }
   //    },
    methods: {
        addCoupon(){
            this.localValueChanged( this.inputValue )
        },
        clearCoupon(){
            console.log("Clearing coupon.")
            this.validatedValue = "";
            this.inputValue = "";
            this.emitCouponChanged( );
        },
        validateCoupon( value ) {
            if ( value === "" ){
                return false;
            }
            return true;
        },
        emitCouponChanged( ) {
            this.$emit("change", this.validatedValue );
        },

        localValueChanged( value ){
            if ( this.validateCoupon( value ) )
            {
                console.log("coupon code updated!")

                this.validatedValue = value;
                this.errorMessage = "";

                this.emitCouponChanged();
            }
            else
            {
                this.errorMessage = "This coupon is invalid or already redeemed!";
            }
        }
    }
}
</script>
