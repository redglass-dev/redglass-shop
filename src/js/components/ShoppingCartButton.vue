<template>
    <div class="relative inline-block">
        <button
            class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white"
            :class="btnClass"
            :style="btnStyle"
            :id="id"
            @click="togglePopover"
        >
          <span v-if="hidePrices">
            <slot name="item-text">Items&nbsp;</slot>
            {{ store.cart.count }}
          </span>
                <span v-else>
            <slot name="total-text">Total&nbsp;$</slot>
            {{ store.cart.totalWithFreight.toFixed(2) }}
          </span>
        </button>

        <popup-control :show="showModal" @close="showModal = false" :parent="id">
            <template #header>
                <div class="p-3">
                    <slot name="above-header"></slot>
                    <div class="flex justify-between items-center w-full mb-2">
                        <strong class="text-sm font-bold text-gray-900">Your Cart</strong>
                        <strong v-if="hidePrices" class="text-sm text-gray-700">Items: {{ store.cart.count }}</strong>
                        <strong v-else class="text-sm text-gray-700">${{ store.cart.totalWithFreight.toFixed(2) }}</strong>
                    </div>
                    <hr class="border-gray-200 mb-2"/>
                    <div class="flex justify-between items-center w-full gap-2">
                        <button
                            type="button"
                            class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
                            @click="store.cart.clear()"
                        >
                            Clear
                        </button>
                        <a
                            v-if="store.cart.count > 0"
                            :href="checkoutUrl"
                            class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                            Checkout
                        </a>
                    </div>
                </div>
            </template>
            <template #body>
                <slot name="cart-list">
                    <shopping-cart-list
                        :show-coupon-input="showCouponInput"
                        :hide-prices="hidePrices"
                        :show-freight-providers="true"
                    ></shopping-cart-list>
                </slot>
            </template>
        </popup-control>
    </div>

    <Notivue v-slot="item">
        <Notification :item="item" :theme="theme"/>
    </Notivue>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useCartStore} from '../stores/CartStore'
import ShoppingCartList from './ShoppingCartList.vue'
import {Notivue, Notification, lightTheme} from 'notivue'
import PopupControl from './PopupControl.vue'

const store = useCartStore()
const showModal = ref(false)
const theme = ref<any>(lightTheme)

const props = withDefaults(defineProps<{
    hidePrices?: boolean
    btnClass?: string
    btnStyle?: string
    id?: string
    checkoutUrl?: string
    showCouponInput?: boolean
}>(), {
    checkoutUrl: '/checkout',
    showCouponInput: false,
    hidePrices: false,
})

const togglePopover = () => {
    showModal.value = !showModal.value
}

onMounted(async () => {
    const notifyTheme = (window as any).env?.NOTIFY_THEME
    if (!notifyTheme || notifyTheme === 'light') {
        return
    }

    try {
        const notivue = await import('notivue')
        switch (notifyTheme) {
            case 'pastel':
                theme.value = notivue.pastelTheme
                break
            case 'material':
                theme.value = notivue.materialTheme
                break
            case 'dark':
                theme.value = notivue.darkTheme
                break
            case 'slate':
                theme.value = notivue.slateTheme
                break
            default:
                theme.value = lightTheme
        }
    } catch (e) {
        console.error('Failed to load notify theme', e)
    }
})
</script>
