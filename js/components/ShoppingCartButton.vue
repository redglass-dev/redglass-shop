<template>
    <div>
        <button :class="btnClass" :style="btnStyle" rel="cart_popover" :id="id" onclick="this.blur();" @click="showPopover()" data-trigger="click" data-placement="bottom">
            <span v-if="hidePrices"><slot name="item-text">Items&nbsp;</slot>{{ store.cart.count }}</span>
            <span v-else><slot name="total-text">Total&nbsp;$</slot>{{ store.cart.totalWithFreight.toFixed(2) }}</span>
        </button>

        <popup-control :show="showModal" @close="showModal = false" @blur="onBlur" :parent="id">
            <template #header>
                <slot name="above-header"></slot>
                <div class="row" @click="showPopover()">
                    <div class="col"><strong>Your Cart</strong></div><div class="col text-end"><strong v-if="hidePrices">Items: {{ store.cart.count }}</strong><strong v-else>${{ store.cart.totalWithFreight.toFixed(2) }}</strong></div>
                </div>
                <hr class="p-0 m-0 mb-1" @click="showPopover()" />
                <div class="row" @click="showPopover()">
                    <div class="col"><button type="button" class="btn btn-sm btn-warning" @click="store.cart.clear()">Clear</button></div>
                    <div class="col text-end" v-if="store.cart.count > 0"><a :href="checkoutUrl" class="btn btn-sm btn-primary">Checkout</a></div>
                </div>
            </template>
            <template #body>
                <!-- @slot Use this for changing the cart list -->
                <slot name="cart-list"><shopping-cart-list :show-coupon-input="showCouponInput" :hide-prices="hidePrices" :show-freight-providers="true"></shopping-cart-list></slot>
            </template>
        </popup-control>
    </div>

    <Notivue v-slot="item">
        <Notification :item="item" :theme="theme" />
    </Notivue>
</template>

<script setup>

import {computed, onMounted, ref} from "vue";
import {useCartStore } from '../stores/cartStore'
import ShoppingCartList from "./ShoppingCartList.vue";
import {Notivue, Notification, lightTheme } from 'notivue'

const store = useCartStore()
const showModal = ref(false)
const theme = ref(lightTheme)

const props = defineProps({
    hidePrices: { type: Boolean, default: false },
    btnClass: { type: String, default: "btn btn-outline-success my-2 my-sm-0" },
    btnStyle: { type: String, default: ""},
    id: { type: String, default: "cartButton" },
    checkoutUrl: {type: String, default: "/checkout"},

    /**
     * Do we want to show the coupon code input?
     */
    showCouponInput: { type: Boolean, default: false },
})

// const theme = computed(() => {
//     if(!import.meta.env.VITE_NOTIFY_THEME) {
//         return lightTheme;
//     }
//
//     switch (import.meta.env.VITE_NOTIFY_THEME) {
//         case 'pastel': return pastelTheme;
//         case 'material': return materialTheme;
//         case 'dark': return darkTheme;
//         case 'slate': return slateTheme;
//         default: return lightTheme;
//     }
// })


function showPopover() {
    if($('[rel=cart_popover]').hasClass('disabled')) {
        return;
    }

    showModal.value = !showModal.value;
}

function onBlur() {
    showModal.value = false;
}

onMounted(async () => {
    if (!window.env || !window.env.NOTIFY_THEME || window.env.NOTIFY_THEME === 'light') {
        return;
    }

    switch (window.env.NOTIFY_THEME) {
        case 'pastel': {
            let {pastelTheme} = await import('notivue')
            theme.value = pastelTheme;
            break;
        }
        case 'material': {
            let {materialTheme} = await import('notivue')
            theme.value = materialTheme;
            break;
        }
        case 'dark': {
            let {darkTheme} = await import('notivue')
            theme.value = darkTheme;
            break;
        }
        case 'slate': {
            let {slateTheme} = await import('notivue')
            theme.value = slateTheme;
            break;
        }

        default:
            theme.value = lightTheme;
    }
})

</script>
