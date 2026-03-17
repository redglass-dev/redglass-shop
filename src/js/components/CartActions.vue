<script setup lang="ts">

import {onMounted} from "vue";
import { useCartStore } from '../stores/CartStore'
import type Cart from "../Cart";

const store = useCartStore()
const props = defineProps({onMounted: {type: Function, default: (cart: Cart) => {}}})

onMounted(() => {
    console.log('CartActions mounted');
    if(props.onMounted === undefined) {
        return;
    }

    props.onMounted(store.cart);
})

</script>

<template>
</template>
