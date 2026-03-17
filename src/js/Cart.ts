import Big from "big.js";
import axios from "axios";
// @ts-ignore
import FreightProvider from "/models/pos/FreightProvider";

declare var localStorage: any;

interface CartItem {
    total: Big;
    calTotal() : Big;

    getQty(): Big;
    // @ts-ignore
    setQty(qty: Big);

    getTotalWeight():Big;
}

export class Invoice implements CartItem {
    memo: string = '';
    invoiceGuid: string = '';
    total: Big = Big(0);
    freightPerItem: Big = Big(0);

    calTotal()
    {
        return Big(this.total);
    }

    getQty() {
        return new Big(1);
    }

    setQty(qty: Big) {
    }

    getTotalWeight() {
        return Big(0);
    }
}

class Profile {
    guid = '';
    name = '';
    max = 0;
    min = 0;
    selected = '';
    sortOrder = 0;
    condiments: Condiment[] = [];
}

class Condiment {
    guid = '';
    name = "";
    price = 0;
    stockGuid = '';
    sortOrder = 0;
    qty = 1;
    selected = false;
}

enum FreightType {
    Direct = 2,
    Weight = 1,
    Value = 4,
    Pallet = 256
}

interface ICartFreight {
    freightGuid: string;
    price: number;
    cost: number;
    qty: number;
    locationGuid: number;
    stockGuid: number;
    name: string;
    freightType: FreightType;
}

// Freight needs to be added properly

class CartFreight implements ICartFreight {
    qty: number = 1;
    price: number = 0.0;
    cost: number = 0;
    locationGuid: number = 0;
    stockGuid: number = 0;
    name: string = '';
    freightType: FreightType = FreightType.Weight;
    freightGuid = '';

    constructor(obj?: ICartFreight) {
        this.freightGuid = obj && obj.freightGuid || '';
        this.price = obj && obj.price || 0;
        this.cost = obj && obj.cost || 0;
        this.qty = obj && obj.qty || 0;
        this.locationGuid = obj && obj.locationGuid || 0;
        this.stockGuid = obj && obj.stockGuid || 0;
        this.name = obj && obj.name || '';
        this.freightType = obj && obj.freightType || FreightType.Weight;
    }

    get priceInc(): number {
        return Number(Big(this.price).toFixed(2));
    }

    set priceInc(newValue) {
    }

    calTotal() {
        return Big(this.price).mul(this.qty);
    }
}

export class MenuItem implements CartItem {
    private qty: number = 0;
    key: string = '';
    guid: string = '';
    name: string = '';
    price: Big = Big(0);
    stockGuid: string = '';
    profiles: Profile[] = [];
    total: Big = Big(0);
    private _weight: number = 0;

    get Qty(): number {
        return this.qty;
    }

    set Qty(newValue) {

        // if(Number(newValue) < 0) {
        //     newValue = 0;
        // }

        this.qty = Number(newValue);
        this.total = Big(this.qty).times(this.getUnitPrice());
    }

    get weight() {
        return this._weight;
    }

    set weight(newValue) {
        if(typeof newValue !== 'undefined') {
            this._weight = newValue;
        } else {
            this._weight = 0;
        }
    }

    constructor() {

    }

    getTotalWeight() {
        //console.log("Get total Weight: " + this.weight + " by " + this.qty);
        return Big(this.weight).times(this.qty);
    }

    calTotal(): Big {
        return Big(this.total);
    }

    getQty() {
        return new Big(this.qty);
    }

    setQty(qty: Big) {
        this.Qty = Number(qty);
    }

    getUnitPrice() {
        var total = this.price;

        //Let's get a list of the condiments
        for(let pkey in this.profiles) {
            let profile = this.profiles[pkey];

            if(profile.max === 1 && profile.min === 1){
                for (let ckey in profile.condiments) {
                    let condiment = profile.condiments[ckey];
                    if (condiment.guid === profile.selected) {
                        if (condiment.stockGuid !== '' && condiment.price > 0.00) {
                            total = Big(Big(total).plus(condiment.price).toFixed(2));
                        }

                        break;
                    }
                }
            } else {
                for (let ckey in profile.condiments) {
                    let condiment = profile.condiments[ckey];
                    if (condiment.selected && condiment.stockGuid !== '' && condiment.price !== 0.00) {
                        total = Big(Big(total).plus(condiment.price).toFixed(2));
                    }
                }
            }
        }

        return total;
    }
}

export class StockItem implements CartItem {
    private qty: number = 0;
    stockGuid: string = '';
    name: string = '';
    value: Big = Big(0);
    total: Big = Big(0);
    weight: number = 0;
    salesTemplateDetailGuid: string = "";

    get Qty(): number {
        return this.qty;
    }

    set Qty(newValue) {
        // @ts-ignore
        if(!(newValue !== '' && !isNaN(parseFloat(newValue)) && isFinite(newValue)) || newValue < 0) {
            newValue = 0;
        }

        this.qty = Number(newValue);
        this.total = Big(this.qty).times(this.value);
    }

    constructor() {

    }

    getTotalWeight() {
        return Big(this.weight).times(this.qty);
    }

    calTotal(): Big {
        return Big(this.total);
        //return Big(this.value).times(this.qty);
    }

    getQty() {
        return new Big(this.qty);
    }

    setQty(qty: Big) {
        this.Qty = Number(qty);
    }
}

export default class Cart {
    //public items: { [id: string]: StockItem } = {};
    public items: StockItem[] = [];
    public invoices: { [id: string]: Invoice } = {};
    public menuitems: { [id: string]: MenuItem } = {};
    public total: Big = Big(0);
    public count: number = 0;
    freightList: CartFreight[] = [];
    public shippingData: any = {City: '', Postcode: '', Pickup: false};
    public freightProviderGuid = '';
    public freightProviders = [];

    // The coupon string is set by the browser.
    public couponString = "";
    // The coupon will be set by the server if the coupon string is valid
    public coupon = null;

    private weight: Big = Big(0);

    constructor() {
        this.load(localStorage.getItem('shopping-cart'));
        this.updateTotal();
    }

    get totalWithFreight(): Big {
        // if(this.freight.guid != '') {
        //     return this.total.plus(this.freight.priceInc);
        // } else {
        return this.total;
        // }
    }

    getProvider(): FreightProvider|null {
        let provider = this.freightProviders.find((item:FreightProvider) => item.guid === this.freightProviderGuid)
        return provider ? provider : null
    }

    getShippingData() {
        let provider = this.getProvider()
        if(provider && provider.isPickup) {
            return { City: provider.pickupCity, Postcode: provider.pickupPostcode, State: provider.pickupState, Street: provider.pickupStreet, Changed: 'none' , IsPickup: provider.isPickup, Pickup: false }
        }

        return this.shippingData
    }

    hasItems() {
        return this.count > 0;
    }

    addItem(type: string, key: string, item: CartItem, save: Boolean = true) {
        switch (type) {
            case 'stockItem' : {
                // if(this.items.hasOwnProperty(key)) {
                //     this.addToTotal(item, false);
                //     this.items[key].Qty = Number(Big(this.items[key].Qty).plus(item.getQty()));
                // } else {
                //     this.addToTotal(item);
                //     this.items[key] = item as StockItem;
                // }

                // Let's add the times
                this.addToTotal(item, true);
                this.items.push(item as StockItem);

                break;
            }
            case 'menuItem' : {
                this.addToTotal(item);
                this.menuitems[key] = item as MenuItem;
                break;
            }
            case 'invoice' : {
                this.addToTotal(item);
                this.invoices[key] = item as Invoice;
                break;
            }
        }

        if(save) {
            this.save();
        }

        return true;
    }

    addStockItem(guid: string, name: string, qty: number, price: number, weight: number = 0.00, save: Boolean = true, salesTemplateDetailGuid: string = "") {
        if(qty > 0) {
            let item = new StockItem();
            item.stockGuid = guid;
            item.value = Big(price);
            item.name = name;
            item.weight = weight;
            item.Qty = qty;
            item.salesTemplateDetailGuid = salesTemplateDetailGuid;
            return this.addItem('stockItem', String(item.stockGuid), item, save);
        }
    }

    /**
     * This will remove an item given it's key.
     * @param type
     * @param key
     */
    removeItem(type:string, key: string) {
        var oldTotal: Big = Big(0);
        var oldWeight: Big = Big(0);

        switch (type) {
            case 'stockItem' : {
                // @ts-ignore
                oldTotal = this.items[key].calTotal();
                // @ts-ignore
                oldWeight = this.items[key].getTotalWeight();
                this.items.splice(Number(key), 1);
                this.count--;
                break;
            }
            case 'menuItem' : {
                oldTotal = this.menuitems[key].calTotal();
                oldWeight = this.menuitems[key].getTotalWeight();
                delete this.menuitems[key];
                this.count--;
                break;
            }
            case 'invoice' : {
                oldTotal = this.invoices[key].calTotal();
                delete this.invoices[key];
                this.count--;
                break;
            }
        }

        this.total = this.total.sub(oldTotal);
        this.weight = this.weight.sub(oldWeight);

        this.save();
    }

    /**
     * This is used to increment or decrement an item in the list.  It is only used for menu items currently.
     * The key will depend on the type of item being incremented eg menu item will used a guid key where stock item would
     * use an index.
     * @param type
     * @param key
     * @param by
     * @param save
     */
    incrementQty(type: string, key: string, by: number, save:Boolean = true) {
        if(type === 'invoice') {
            return;
        }

        let item = this.getCartItem(type, key);
        let newQty = item?.getQty().plus(by);
        if(newQty === null) { return; }
        this.setItemQty(type, key, newQty, save);
    }

    private setItemQty(type: string, key: string, qty: any, save: Boolean = true) {
        let bigQty = Big(qty);

        switch (type) {
            case 'stockItem' : {
                // @ts-ignore
                let oldTotal = this.items[key].calTotal();
                // @ts-ignore
                let oldWeight = this.items[key].getTotalWeight();
                // @ts-ignore
                this.items[key].Qty = Number(bigQty);
                // @ts-ignore
                this.items[key].total = Big(this.items[key].calTotal().toFixed(2));

                // @ts-ignore
                this.total = this.total.sub(oldTotal).add(this.items[key].total);
                // @ts-ignore
                this.weight = this.weight.sub(oldWeight).add(this.items[key].getTotalWeight());

                break;
            }
            case 'menuItem' : {
                let oldTotal = this.menuitems[key].calTotal();
                let oldWeight = this.menuitems[key].getTotalWeight();
                this.menuitems[key].Qty = Number(bigQty);
                this.menuitems[key].total = Big(this.menuitems[key].calTotal().toFixed(2));

                this.total = this.total.sub(oldTotal).add(this.menuitems[key].total);
                this.weight = this.weight.sub(oldWeight).add(this.menuitems[key].getTotalWeight());

                break;
            }
            case 'invoice' : {
                return;
            }
        }

        if(save) {
            this.save();
        }
    }

    save() {
        this.updateFreight();
    }

    clear(save: Boolean = true) {
        this.items = [];
        this.invoices = {};
        this.menuitems= {};
        this.total = Big(0);
        this.weight = Big(0);
        this.count = 0;
        this.shippingData = {City: '', Postcode: ''};
        this.freightList = [];
        this.couponString = "";
        this.coupon = null;
        this.freightProviderGuid = '';

        for(let key in this.freightProviders) {
            // @ts-ignore
            if(this.freightProviders[key].isDefault) {
                // @ts-ignore
                this.freightProviderGuid = this.freightProviders[key].guid;
                break;
            }
        }

        if(save) {
            this.save();
        }
    }

    validate(url:any, shippingData: any) {
        this.shippingData = shippingData;

        // Validate the cart.
        return new Promise((resolve, reject) => {
            // Let's make sure we have written the current object to memory.
            localStorage.setItem('shopping-cart', JSON.stringify(this));
            let cartData = localStorage.getItem('shopping-cart');
            axios.post(url, { cart: cartData, shippingData: shippingData })
                .then(response => {
                    this.load(JSON.stringify(response.data));
                    this.save();
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    private load(data:any) {
        // Let's clear the cart
        this.clear(false);

        let json = JSON.parse(data);
        if(typeof json === 'undefined' || json === null)
            return;

        this.shippingData = json.shippingData;
        this.freightProviderGuid = json.freightProviderGuid;
        this.freightProviders = json.freightProviders;
        this.couponString = json.couponString;

        this.freightList = [];
        for(let key in json.freightList) {
            let freight = new CartFreight(json.freightList[key]);
            this.freightList.push(freight);
        }

        // Let's add the items
        for (var key in json.items) {
            let t = json.items[key];
            let tmp = new StockItem();
            for(var i in tmp) {
                if(t && i && t.hasOwnProperty(i)) {
                    // @ts-ignore
                    tmp[i] = t[i];
                }
            }

            this.addItem('stockItem', key, tmp, false);
        }

        // Let's add the menu items.
        for (let key in json.menuitems) {
            let t = json.menuitems[key];
            let tmp = new MenuItem();
            for(let i in tmp) {
                if(t.hasOwnProperty(i)) {
                    // @ts-ignore
                    tmp[i] = t[i];
                }
            }

            this.addItem('menuItem', key, tmp, false);
        }

        // Let's add the invoices
        for (let key in json.invoices) {
            let t = json.invoices[key];
            let tmp = new Invoice();
            for(let i in tmp) {
                if(t.hasOwnProperty(i)) {
                    // @ts-ignore
                    tmp[i] = t[i];
                }
            }

            this.addItem('invoice', key, tmp, false);
        }

        //TODO: Should we do this? this.updateTotal();
    }

    private addToTotal(item: CartItem, isNew: boolean = true) {
        this.total = this.total.plus(item.calTotal());
        this.weight = this.weight.plus(item.getTotalWeight());
        if (isNew) {
            this.count++;
        }
    }

    private getCartItem(type: string, key: string): CartItem|null {
        switch (type) {
            case 'stockItem' : {
                // @ts-ignore
                return this.items[key];
            }
            case 'menuItem' : {
                return this.menuitems[key];
            }
            case 'invoice' : {
                return this.invoices[key];
            }
        }

        return null;
    }

    private updateTotal() {
        var total = Big(0);

        for (let key in this.items) {
            total = total.plus( this.items[key].calTotal());
        }

        for (let key in this.invoices) {
            total = total.plus( this.invoices[key].calTotal());
        }

        for (let key in this.menuitems) {
            total = total.plus( this.menuitems[key].calTotal());
        }

        for(let key in this.freightList) {
            total = total.plus(this.freightList[key].calTotal());
        }

        this.total = total;
    }

    private updateFreight() {
        if(this.isEmpty(this.items) && this.isEmpty(this.menuitems)) {
            this.freightList = [];
            this.updateTotal();
            localStorage.setItem('shopping-cart', JSON.stringify(this));
            return;
        }

        axios.post('/api/v1/update-freight', { cart: JSON.stringify(this), shippingData: this.shippingData }).then (response => {
            // Let's load the freight into the cart
            //console.log("Updating Cart Freight: ", this.shippingData, response.data);
            this.load(response.data);
            this.updateTotal();
            localStorage.setItem('shopping-cart', JSON.stringify(this));
        }).catch(error => {
            // @ts-ignore
            console.log(error);
            if(error.response.status === 401) {
                this.freightList = [];
            }

            // Let's make sure the totals are correct
            this.updateTotal();
            localStorage.setItem('shopping-cart', JSON.stringify(this));
        });
    }

    private isEmpty(obj:any) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }
}
