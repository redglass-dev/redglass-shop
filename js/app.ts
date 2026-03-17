import { createApp } from 'vue';
// @ts-ignore
import HelloWorld from './components/HelloWorld.vue';
// @ts-ignore
import Cart from './components/Cart.vue';
// @ts-ignore
import AddToCart from './components/AddToCart.vue';
// @ts-ignore
import StockCategoryGroupMenu from "./components/StockCategoryGroupMenu.vue";
// @ts-ignore
import NavMenuGroup from "./components/NavMenuGroup.vue";
// @ts-ignore
import component from './vue-shims';
import { NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger } from 'reka-ui';
import NavigationMenuListItem from './components/NavigationMenuListItem.vue';
import { Icon } from '@iconify/vue';
// @ts-ignore
import StockCardList from "./components/StockCardList.vue";
// @ts-ignore
import StockViewControl from "./components/StockViewControl.vue";

export function registerRedglassShopVue(app: any) {
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
}
