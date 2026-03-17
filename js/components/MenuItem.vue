 <template>
    <div v-bind:class="['col-sm-12', 'border', 'border-1', 'rounded']" style="margin: 6px; overflow: hidden;">
        <div class="row px-0" @click="showModal()">
            <div class="d-none d-md-block col-4 bg-grey p-3">
                <div class="w-100">
                    <h4>{{ itemName }}</h4>
                    <p class="pb-0 mb-0">{{ descriptionShort }}</p>
                </div>
                <div class="w-100">
                    <span class="text-dark">${{ price }}</span>
                </div>
            </div>
            <div class="col-12 col-md-8 px-0">
                <img class="img-fluid" :src="thumbnail"/>
            </div>
            <div class="d-block d-md-none col-12 bg-grey p-3">
                <div class="w-100">
                    <h4>{{ itemName }}</h4>
                    <p class="pb-0 mb-0">{{ descriptionShort }}</p>
                </div>
                <div class="w-100">
                    <span class="text-dark">${{ price }}</span>
                </div>
            </div>
        </div>

        <div class="modal" :id="'menuItemModal' + item" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div :class="'modal-header ' + headerClass" :style="headerStyle">
                        <h5 v-if="!titleInBody" :class="'modal-title ' + titleClass">{{ itemName }}</h5>
                        <button type="button" class="btn btn-xs btn-outline-danger pb-1" style="padding-top: 6px;" data-dismiss="modal" aria-label="Close">
                            <vue-feather type="x" size="1.4em"></vue-feather>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h5 v-if="titleInBody" :class="'modal-title ' + titleClass" :style="titleStyle">{{ itemName }}</h5>
                        <p><span v-html="description"></span></p>
                        <div v-for="(profile, key) in menuItem.profiles" :key="key">
                            <div v-if="(profile.max === 1 && profile.min === 1)">
                                <h5>{{ profile.name }} <span class="text-muted">(Choose 1)</span></h5>
                                <div class="form-group col-sm-12" v-for="(condiment, key) in profile.condiments" :key="key">
                                    <div class="form-check form-check-inline col-sm-7">
                                        <input class="form-check-input" type="radio" v-model="profile.selected" :value="condiment.guid" :id="'p_' + profile.guid + 'c_' + condiment.guid" :name="'p_' + profile.guid" @change="condimentSelected($event, profile, condiment)"/>
                                        <label :for="'p_' + profile.guid + 'c_' + condiment.guid" class="form-check-label">{{ condiment.name }}</label>
                                    </div>
                                    <div class="form-check form-check-inline text-muted text-end col-sm-4"> <span v-if="condiment.price > 0" class="form-check-text text-muted"> +${{ condiment.price }}</span></div>
                                </div>
                            </div>
                            <div v-else-if="profile.max === profile.min">
                                <h5>{{ profile.name }}
                                    <span v-if="profile.min > 0" class="text-muted"> (Choose {{ profile.min}})</span>
                                    <span v-else class="text-muted"> (Choose between 0 and {{ profile.condiments.length }})</span>
                                </h5>
                                <div class="form-group col-sm-12" v-for="(condiment, key) in profile.condiments" :key="key">
                                    <div class="form-check form-check-inline col-sm-7">
                                        <input class="form-check-input" type="checkbox" v-model="condiment.selected" :checked="condiment.selected" :value="condiment.guid" :name="'p_' + profile.guid + 'c_' + condiment.guid" :id="'p_' + profile.guid + 'c_' + condiment.guid" @change="condimentSelected($event, profile, condiment)"/>
                                        <label :for="'p_' + profile.guid + 'c_' + condiment.guid" class="form-check-label">{{ condiment.name }}</label>
                                    </div>
                                    <div class="form-check form-check-inline text-muted text-end col-sm-4"> <span v-if="condiment.price > 0" class="form-check-text text-muted"> +${{ condiment.price }}</span></div>
                                </div>
                            </div>
                            <div v-else>
                                <h5>{{ profile.name }} <span class="text-muted">(Choose between {{ profile.min }} and {{ profile.max}})</span></h5>
                                <h6 class="badge badge-danger" v-if="errors.has('p_' + profile.guid)">You must select a at least {{ profile.min }} items.</h6>
                                <div class="form-group col-sm-12" v-for="(condiment, key) in profile.condiments" :key="key">
                                    <div class="form-check form-check-inline col-sm-7">
                                        <input class="form-check-input" type="checkbox" v-model="condiment.selected" :checked="condiment.selected"  :id="'p_' + profile.guid + 'c_' + condiment.guid" :value="condiment.guid" :name="'p_' + profile.guid + 'c_' + condiment.guid" @change="condimentSelected($event, profile, condiment)"/>
                                        <label :for="'p_' + profile.guid + 'c_' + condiment.guid" class="form-check-label">{{ condiment.name }}</label>
                                    </div>
                                    <div class="form-check form-check-inline text-end col-sm-4"> <span v-if="condiment.price > 0" class="form-check-text text-muted"> +${{ condiment.price }}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <table v-if="!loading" style="background: none; padding: 0 !important; margin: 0 !important;">
                            <tbody>
                                <tr style="background: none; border: none; padding: 0 !important; margin: 0 !important;">
                                    <td style="background: none; border: none; padding: 2px !important; margin: 0 !important;"><button type="button" id="minus_button" :class="'btn btn-sm btn-outline-secondary rounded-circle ' + isDisabled + 'pb-1'" onclick="this.blur();" style="padding-top: 10px;" @click="incrementQty(-1)"><vue-feather type="minus" size="1.4em"></vue-feather></button></td>
                                    <td style="background: none; border: none; padding: 2px !important; margin: 0 !important;"><span  id="QtyCell">{{ menuItem.qty }}</span></td>
                                    <td style="background: none; border: none; padding: 2px !important; margin: 0 !important;"><button type="button" class="btn btn-sm btn-outline-secondary rounded-circle pb-1"  onclick="this.blur();" style="padding-top: 10px;" @click="incrementQty(1)"><vue-feather type="plus" size="1.4em"></vue-feather></button></td>
                                    <td class="text-end" style="background: none; border: none; padding: 2px !important; margin: 0 !important; width: 100%;">
                                        <button id="buyButton" type="button" class="btn btn-success" :disabled="errors.any()" @click="buy">Buy ${{ menuItem.total }}</button>&nbsp;<button type="button" class="btn btn-xs btn-outline-danger pb-1" style="padding-top: 10px;" data-dismiss="modal" aria-label="Close">
                                        <vue-feather type="x" size="1.2em"></vue-feather>
                                    </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span v-else><vue-feather type="loader" animation="spin" animation-speed="fast" size="1.4em"></vue-feather></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { FormErrors } from './libraries/jl-general/helpers/Form'
    import Big from 'big.js'
    import { MenuItem } from "../Cart";
    import uuid from 'uuid-random';
    import {useCartStore} from "../stores/cartStore"
    import {mapState} from 'pinia'
    import {push} from "notivue";

    /**
     * Menu Item
     *
     * This is the control used to display a menu item for a restaurant.
     */
    export default {
        name: 'MenuItem',
        props: {
            itemName: { type: String, required:true },
            item: { type: String },
            price: { type: [String, Number] },
            description:{ type: String, default: '' },
            thumbnail:{ type: String, default: '' },
            headerStyle:{ type: String, default: '' },
            headerClass:{ type: String, default: '' },
            titleClass:{ type: String, default: '' },
            isOpen: { type: Boolean, default: true },
            descriptionLength: { default: 105 },
            minHeight: { default: 125 },
            titleInBody: { type: Boolean, default: false },
            titleStyle: { type: String, default: "text-shadow: 1px 1px #f0f0f0; font-weight: bold; font-size: 1.6em;"},
        },
        components: { Big },
        computed: {
            ...mapState(useCartStore, {cart: "cart"}),
            descriptionShort: function () {
                let clamp = '...';
                let node = document.createElement('div');
                node.innerHTML = this.description;
                let content = node.textContent;
                return content.length > this.descriptionLength ? content.slice(0, this.descriptionLength) + clamp : content;
            }
        },
        data() {
            return {
                profiles : [],
                errors: new FormErrors(),
                menuItem: {key: '', guid: null, name: '', stockGuid: '', price: 0.00, total:0.00, qty: 1, stockBoxWeight: 0.00, profiles: []},
                isDisabled: ' disabled',
                loading: true,
            };
        },
        mounted() {
            //this.loadMenuItem();
        },
        methods: {
            loadMenuItem() {
                this.loading = true;
                this.menuItem.price = this.price;
               // this.setTotal();
                //this.menuItem.total = 0.00;
                // console.log('loading menu item');

                axios.get('/api/v1/menu-items/' + this.item)
                    .then(response => {
                        // console.log('api called');
                        return response.data;
                    }).then(data => {
                        console.log(data);
                        this.menuItem.key = uuid();
                        this.menuItem.guid = data.guid;
                        this.menuItem.stockGuid = data.stockGuid;
                        this.menuItem.name = data.name;
                        this.menuItem.stockBoxWeight = data.stock.boxWeight;

                        var pros = [];
                        let tmpErrors = {};

                        for(let profileKey in data.condiment_profiles) {
                            let tmp = {
                                guid: data.condiment_profiles[profileKey].guid,
                                name: data.condiment_profiles[profileKey].name,
                                max: data.condiment_profiles[profileKey].maxSelection,
                                min: data.condiment_profiles[profileKey].minSelection,
                                selected: '',
                                sortOrder: data.condiment_profiles[profileKey].orderBy,
                                condiments: []
                            };

                            for(let condKey in data.condiment_profiles[profileKey].condiments) {
                                // console.log('loading condiment profile');
                                // price = data.condiment_profiles[profileKey].condiments[condKey].priceInc;
                                console.log(data.condiment_profiles[profileKey].condiments[condKey].priceInc)
                                let tmpCond = {
                                    guid: data.condiment_profiles[profileKey].condiments[condKey].guid,
                                    name: data.condiment_profiles[profileKey].condiments[condKey].name,
                                    price: Big(data.condiment_profiles[profileKey].condiments[condKey].priceInc).toFixed(2),
                                    stockGuid: data.condiment_profiles[profileKey].condiments[condKey].stockGuid,
                                    sortOrder: data.condiment_profiles[profileKey].condiments[condKey].orderBy,
                                    qty: 1,
                                    selected: false
                                };

                                tmp.condiments.push(tmpCond);
                                // console.log('loaded a condiment profile.')
                                console.log(this.errors.any())
                            }

                            if(this.isRadio(tmp)) {
                                tmp.selected = tmp.condiments[0].guid;
                            } else if( tmp.min > 0 ) {
                                tmpErrors["p_" + tmp.guid] = {description: 'Missing condiments'};
                            }

                            pros.push(tmp);
                        }

                        this.errors.record(tmpErrors);
                        this.$set(this.menuItem, 'profiles', pros);

                        this.setTotal();
                        this.loading = false;
                        return true;
                    });
            },
            buy() {
                this.resetMinimumSelectedErrors();

                if(!this.errors.any()) {
                    console.log(this.menuItem);
                    let item = new MenuItem();
                    item.key = this.menuItem.key;
                    item.guid = this.menuItem.guid;
                    item.name = this.menuItem.name;
                    item.price = Big(this.menuItem.price);
                    item.profiles = this.menuItem.profiles;
                    item.Qty = this.menuItem.qty;
                    item.stockGuid = this.menuItem.stockGuid;
                    item.weight = this.menuItem.stockBoxWeight;
                    this.cart.addItem('menuItem', item.key, item);

                    $('#menuItemModal' + this.item).modal('toggle');
                    push.success(this.menuItem.qty + ' ' + this.menuItem.name + ' added to cart')
                }
            },
            resetMinimumSelectedErrors() {
                let tmp = {};

                for (let profileKey in this.menuItem.profiles) {
                    let profile = this.menuItem.profiles[profileKey];

                    if (!this.isMinimumSelected(profile)) {
                        // this.errors.add("p_" + profile.guid, "p_" + profile.guid);
                        // this.hasErrors = true;
                        tmp["p_" + profile.guid] = {description: 'Missing condiments'};
                    }
                }

                this.errors.record(tmp);
            },
            isMinimumSelected(profile) {
                if (!this.isRadio(profile)) {
                    return this.countCondiments(profile) >= profile.min;
                }

                return true;
            },
            isRadio(profile) {
                return profile.min === 1 && profile.max === 1;
            },
            showModal() {
                if(this.isOpen) {
                    this.loadMenuItem();
                    $('#menuItemModal' + this.item).modal().show();
                }
            },
            setTotal() {

                var total = Big(this.menuItem.price).times(this.menuItem.qty).toFixed(window.unitRound);

                for (let profileKey in this.menuItem.profiles) {
                    let profile = this.menuItem.profiles[profileKey];
                    if(this.isRadio(profile)) {
                        for(let ckey in profile.condiments) {
                            let condiment = profile.condiments[ckey];
                            if(condiment.guid === profile.selected) {
                                total = Big(condiment.price).times(this.menuItem.qty).plus(total).toFixed(window.unitRound);
                                break;
                            }
                        }
                    } else {
                        for (let ckey in this.menuItem.profiles[profileKey].condiments) {
                            let condiment = this.menuItem.profiles[profileKey].condiments[ckey];
                            if (condiment.selected && condiment.price > 0) {
                                total = Big(condiment.price).times(this.menuItem.qty).plus(total).toFixed(window.unitRound);
                            }
                        }
                    }
                }

                this.menuItem.total = total;
            },
            condimentSelected: function(event, profile, cond) {
                this.$nextTick(function () {
                    this.resetMinimumSelectedErrors();

                    // Lets make sure we can not select more than the max for this profile
                    if (event.target.type === 'checkbox' && event.target.checked) {
                        var condimentCount = this.countCondiments(profile);

                        if (!(condimentCount <= profile.max || profile.max === 0)) {
                            // Remove then add
                            for (var condimentKey in profile.condiments) {
                                if (profile.condiments[condimentKey].selected && cond.guid !== profile.condiments[condimentKey].guid) {
                                    profile.condiments[condimentKey].selected = false;
                                    break;
                                }
                            }
                        }
                    }

                    this.setTotal();
                })
            },
            countCondiments(profile) {
                var count = 0;

                for(var condimentKey in profile.condiments) {
                    if(profile.condiments[condimentKey].selected) {
                        count++;
                    }
                }

                return count;
            },
            incrementQty(incrementor) {
                if(Big(this.menuItem.qty).plus(incrementor).eq(0)) {
                    this.isDisabled = ' disabled';
                } else {
                    this.isDisabled = '';
                    this.menuItem.qty = Big(this.menuItem.qty).plus(incrementor).toFixed(0);
                    if(Big(this.menuItem.qty).eq(1)) {
                        this.isDisabled = ' disabled';
                    }
                    this.setTotal();
                }
            }
        }
    }
</script>
