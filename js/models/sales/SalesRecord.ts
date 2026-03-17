import SalesDetailRecord from "./SalesDetailRecord";
import {PriceGroup} from "../general/PriceGroup";
import Customer, {ICustomer} from "../contacts/Customer";

export interface ISalesRecord {
    customerGuid: string;
    company: string;
    accountGuid: string;
    branchGuid: string;
    priceGroup: PriceGroup;
    email: string;
    firstName: string;
    lastName: string;
    billingPhone: string;
    deliveryStreet: string;
    deliveryCity: string;
    deliveryPostcode: string;
    deliveryCountry: string;
    deliveryState: string;
    deliveryContact: string;
    deliveryPhone: string;
    billingStreet: string;
    billingCity: string;
    billingPostcode: string;
    billingCountry: string;
    billingState: string;
    customerOrderNo: string;
    memo: string;
    adminNotes: string;
    publicNotes: string;
}

export default class SalesRecord implements ISalesRecord{
    customerGuid: string = '';
    company: string = '';
    accountGuid: string = '';
    branchGuid: string = '';
    priceGroup: PriceGroup = PriceGroup.Retail;
    email: string = '';
    firstName: string = '';
    lastName: string = '';
    billingPhone: string = '';
    deliveryStreet: string = '';
    deliveryCity: string = '';
    deliveryPostcode: string = '';
    deliveryCountry: string = '';
    deliveryState: string = '';
    deliveryContact: string = '';
    deliveryPhone: string = '';
    billingStreet: string = '';
    billingCity: string = '';
    billingPostcode: string = '';
    billingCountry: string = '';
    billingState: string = '';
    customerOrderNo: string = '';
    memo: string = '';
    adminNotes: string = '';
    publicNotes: string = '';

    details: SalesDetailRecord[] = [];

    getTotalWeight() {
        var total = 0.00;
        for(let key in this.details) {
            total += this.details[key].totalWeight();
        }

        return total;
    }

    static isNumber(num:any) {
        return !isNaN(parseFloat(num)) && isFinite(num);
    }

    updateHeader(obj: ISalesRecord) {
        this.customerGuid = obj && obj.customerGuid || '';
        this.company = obj && obj.company || '';
        this.accountGuid = obj && obj.accountGuid || '';
        this.branchGuid = obj && obj.branchGuid || '';
        this.priceGroup = obj && obj.priceGroup || PriceGroup.Retail;
        this.firstName = obj && obj.firstName || '';
        this.lastName = obj && obj.lastName || '';
        this.email = obj && obj.email || '';
        this.deliveryStreet = obj && obj.deliveryStreet || '';
        this.deliveryCity = obj && obj.deliveryCity || '';
        this.deliveryPostcode = obj && obj.deliveryPostcode || '';
        this.deliveryCountry = obj && obj.deliveryCountry || '';
        this.deliveryState = obj && obj.deliveryState || '';
        this.deliveryContact = obj && obj.deliveryContact || '';
        this.deliveryPhone = obj && obj.deliveryPhone || '';
        this.billingStreet = obj && obj.billingStreet || '';
        this.billingCity = obj && obj.billingCity || '';
        this.billingPostcode = obj && obj.billingPostcode || '';
        this.billingCountry = obj && obj.billingCountry || '';
        this.billingState = obj && obj.billingState || '';
        this.billingPhone = obj && obj.billingPhone || '';
        this.customerOrderNo = obj && obj.customerOrderNo || '';
        this.memo = obj && obj.memo || '';
        this.adminNotes = obj && obj.adminNotes || '';
        this.publicNotes = obj && obj.publicNotes || '';
    }

    setCustomer(obj: ICustomer) {
        let customer = new Customer(obj);

        this.customerGuid = customer.guid;
        this.company = customer.company;
        this.accountGuid = customer.accountGuid;
        this.firstName = customer.firstName;
        this.lastName = customer.lastName;
        this.email = customer.email;
        this.deliveryStreet = customer.getAddress().street;
        this.deliveryCity = customer.getAddress().city;
        this.deliveryCountry = customer.getAddress().country;
        this.billingStreet = customer.getAddress("Billing").street;
        this.billingCity = customer.getAddress("Billing").city;
        this.billingPostcode = customer.getAddress("Billing").postcode;
        this.billingCountry = customer.getAddress("Billing").country;
        this.billingState = customer.getAddress("Billing").state;
        if (customer.hasPhone("Mobile") && customer.getPhone("Mobile").phoneNumber != '') {
            this.deliveryPhone = customer.getPhone("Mobile").phoneNumber;
        } else {
            this.deliveryPhone = customer.getPhone().phoneNumber;
        }
        this.deliveryPostcode = customer.getAddress().postcode;
        this.deliveryState = customer.getAddress().state;
        this.billingPhone = this.deliveryPhone;
        this.priceGroup = customer.account ? customer.account.priceGroup : PriceGroup.Retail;
    }
}
