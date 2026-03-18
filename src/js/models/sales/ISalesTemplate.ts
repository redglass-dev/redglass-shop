import IDataObject from "../general/IDataObject";
import {PriceGroup} from "../general/PriceGroup";
import {ISalesRecord} from "./SalesRecord";

export default interface ISalesTemplate extends IDataObject {
    name: string;
    customerGuid: string;
    accountGuid: string;
    branchGuid: string;
    deliveryRouteGuid: string;
    syncCounter: number;
    detailSyncCounter: number;
    totalValue: number;
    priceGroup: PriceGroup;
    company: string;
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
    billingPhone: string;
    customerOrderNo: string;
    memo: string;
    firstName: string;
    lastName: string;
    adminNotes: string;
    publicNotes: string;
    useCurrentStockPrices: boolean;
    email: string;
}
