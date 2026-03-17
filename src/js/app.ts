// import { createApp } from 'vue';
// // @ts-ignore
// import HelloWorld from './components/HelloWorld.vue';
// // @ts-ignore
// import Cart from './components/Cart.vue';
// // @ts-ignore
// import AddToCart from './components/AddToCart.vue';
// // @ts-ignore
// import StockCategoryGroupMenu from "./components/StockCategoryGroupMenu.vue";
// // @ts-ignore
// import NavMenuGroup from "./components/NavMenuGroup.vue";
// // @ts-ignore
// // import component from './vue-shims';
// import { NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger } from 'reka-ui';
// import NavigationMenuListItem from './components/NavigationMenuListItem.vue';
// import { Icon } from '@iconify/vue';
// // @ts-ignore
// import StockCardList from "./components/StockCardList.vue";
// // @ts-ignore
// import StockViewControl from "./components/StockViewControl.vue";


import VueFeather from 'vue-feather';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/themes/material_blue.css';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import 'notivue/notification.css' // Only needed if using built-in <Notification />
import 'notivue/animations.css'

// @ts-ignore
import MenuItem from "./components/MenuItem.vue";

// @ts-ignore
import { EventBus } from './EventBus'
// @ts-ignore
import StockItem from "./components/StockItem.vue";
// @ts-ignore
import ShoppingCartList from "./components/ShoppingCartList.vue";
// @ts-ignore
import ShoppingCartButton from "./components/ShoppingCartButton.vue";
// @ts-ignore
import PopupControl from "./components/PopupControl.vue";
// @ts-ignore
import SalesTemplates from "./components/SalesTemplates.vue";
// @ts-ignore
import SalesTemplateForm from "./components/SalesTemplateForm.vue";
// @ts-ignore
import Specials from "./components/Specials.vue";
// @ts-ignore
import Checkout from "./components/Checkout.vue";
// @ts-ignore
import AddressInput from "./components/controls/AddressInput.vue";
// @ts-ignore
import StockItemControl from "./components/StockItemControl.vue";
// @ts-ignore
import StockViewControl from "./components/StockViewControl.vue";
// @ts-ignore
import StockCarousel from "./components/StockCarousel.vue";
// @ts-ignore
import StockListItemControl from "./components/StockListItemControl.vue";
// @ts-ignore
import StockCardList from "./components/StockCardList.vue";
// @ts-ignore
import SurfaceAreaCalculator from "./components/SurfaceAreaCalculator.vue";
// @ts-ignore
import CartActions from "./components/CartActions.vue"; // Only needed if using default animations

// @ts-ignore
window.unitRound = 2;

// @ts-ignore
window.hidePrices = false;

import { createPinia } from 'pinia'
import {createNotivue} from 'notivue'


export function registerRedglassShop(app: any) {
    // app.component('shopping-cart', Cart);
    // app.component('add-to-cart', AddToCart);
    // app.component('stock-category-group-menu', StockCategoryGroupMenu);
    // app.component('stock-card-list', StockCardList)
    // app.component('stock-view-control', StockViewControl)
    // app.component('nav-menu-group', NavMenuGroup);
    // app.component('nav-menu-item', NavigationMenuItem)
    // app.component('nav-menu-trigger', NavigationMenuTrigger)
    // app.component('nav-menu-link', NavigationMenuLink)
    // app.component('nav-menu-content', NavigationMenuContent)
    // app.component('nav-menu-list-item', NavigationMenuListItem)
    // app.component('icon', Icon)

    const pinia = createPinia()

    app.use(pinia)

    const notivue = createNotivue({
        // @ts-ignore
        position: window.env.NOTIFY_POS ? window.env.NOTIFY_POS : 'top-right',
        enqueue: true,
        avoidDuplicates: false,
        notifications: {
            global: {
                // @ts-ignore
                duration: window.env.NOTIFY_TIMEOUT ? window.env.NOTIFY_TIMEOUT : 10000
            }
        }
    })

    app.use(notivue)

    app.config.compilerOptions.whitespace = 'preserve'

    app.component(VueFeather.name, VueFeather);
    app.component('menu-item', MenuItem)
    app.component('stock-item', StockItem)
    app.component('shopping-cart-list', ShoppingCartList)
    app.component('shopping-cart-button', ShoppingCartButton)
    app.component('popup-control', PopupControl)
    app.component('sales-templates', SalesTemplates)
    app.component('sales-template', SalesTemplateForm)
    app.component('specials', Specials)
    app.component('checkout', Checkout)
    app.component('address-input', AddressInput)
    app.component("stock-item-control", StockItemControl)
    app.component("stock-view-control", StockViewControl)
    app.component("stock-list-item-control", StockListItemControl)
    app.component("stock-carousel", StockCarousel)
    app.component("stock-card-list", StockCardList)
    app.component("surface-area-calculator", SurfaceAreaCalculator)
}

// @ts-ignore
window.EventBus = EventBus;
