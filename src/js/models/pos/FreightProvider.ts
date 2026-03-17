import IDataObject from "../general/IDataObject";
import  uuid from "uuid-random";

interface IFreightProvider extends IDataObject {
    name: string;
    description: string;
    settings: string;
    logoUrl: string;
    isDefault: boolean;
    branchGuid: string;
    isPickup: boolean;
    pickupStreet: string;
    pickupCity: string;
    pickupState: string;
    pickupPostcode: string;
    pickupPhone: string;
    pickupCountry: string;
    parentProviderGuid: string;
}

export default class FreightProvider implements IFreightProvider {
    guid: string = '';
    name: string = '';
    description: string = '';
    logoUrl: string = '';
    isDefault: boolean = false;
    settings: string = '';
    branchGuid: string = '';
    isPickup: boolean = false;
    pickupStreet: string = '';
    pickupCity: string = '';
    pickupState: string = '';
    pickupPostcode: string = '';
    pickupPhone: string = '';
    pickupCountry: string = '';
    parentProviderGuid: string = '';

    constructor(obj? : IFreightProvider) {
        this.update(obj);
    }

    getShippingData() {
        if(this.isPickup)
            return { City: this.pickupCity, Postcode: this.pickupPostcode, State: this.pickupState, Street: this.pickupStreet, Changed: 'none' , IsPickup: this.isPickup, Pickup: false }

        return null;
    }

    getAddress(asDelivery: boolean = false) {
        if(asDelivery) {
            return { deliveryStreet: this.pickupStreet, deliveryCity: this.pickupCity, deliveryState: this.pickupState, deliveryPostcode: this.pickupPostcode, deliveryCountry: this.pickupCountry }
        }

        return { street: this.pickupStreet, city: this.pickupCity, state: this.pickupState, postcode: this.pickupPostcode }
    }

    update(obj? : IFreightProvider) {
        this.guid = obj && obj.guid || uuid();
        this.name = obj && obj.name || '';
        this.logoUrl = obj && obj.logoUrl || '';
        this.description = obj && obj.description || '';
        this.settings = obj && obj.settings || '';
        this.isDefault = obj && obj.isDefault || false;
        this.branchGuid = obj && obj.branchGuid || '';
        this.isPickup = obj && obj.isPickup || false;
        this.pickupStreet = obj && obj.pickupStreet || '';
        this.pickupCity = obj && obj.pickupCity || '';
        this.pickupState = obj && obj.pickupState || '';
        this.pickupPostcode = obj && obj.pickupPostcode || '';
        this.pickupPhone = obj && obj.pickupPhone || '';
        this.pickupCountry = obj && obj.pickupCountry || '';
        this.parentProviderGuid = obj && obj.parentProviderGuid || '';
    }
}
