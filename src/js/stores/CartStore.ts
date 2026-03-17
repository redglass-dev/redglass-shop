import { defineStore } from 'pinia'
import Cart from "../Cart";
import {ref} from "vue";

export const useCartStore = defineStore('cart-store', () => {
    const cart = new Cart()

    return { cart }
})
