import IDataObject from "../general/IDataObject";
import SalesInvoiceAllocation from "./SalesInvoiceAllocation";
import ISalesInvoiceDetail from "./ISalesInvoiceDetail";
import SalesInvoiceReceipt from "./SalesInvoiceReceipt";
import {PriceGroup} from "../general/PriceGroup";

export enum SalesInvoiceStatus {
    Open = 1,
    Closed = 2
}

export enum DeliveryStatus {
    Ready = 1,
    Delivered = 2,
    None = 4
}

export default interface ISalesInvoice extends IDataObject {
    accountGuid: string;
    userGuid: string;
    branchGuid: string;
    jobTicketGuid: string;
    status: SalesInvoiceStatus;
    priceGroup: PriceGroup;
    queGuid: string;
    shiftGuid: string;
    tableGuid: string;
    salesOrderGuid: string;
    terminalGuid:string;
    covers: number;
    salesQuoteGuid: string;
    deliveryRouteGuid: string;
    customerGuid: string;
    dataEntryUserGuid: string;
    from: number;
    fromApp: number;
    total: number;
    outstanding: number;
    firstName: string;
    lastName: string;
    memo: string;
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
    roomRef: string;
    loyaltyCardNo: string;
    deliveredStatus: DeliveryStatus;
    tableNum: string;
    adminNotes: string;
    publicNotes:string;
    paymentDateTime: string;
    kitchenPrintTime: string;
    date: string;
    requiredDate: string;
    printedToKitchen: boolean;
    pickup: boolean;
    delivery: boolean;
    printed: boolean;
    emailed: boolean;
    accountFromPos: boolean;
    fromAccounting: boolean;
    trackingId: number;
    invoiceNum: number;
    company: string;
    totalEx: number;
    totalTax: number;
    amountPaid: number;
    extRefId: string;
    locked: boolean;
    export: boolean;
    email: string;
    allocations: SalesInvoiceAllocation[];
    receipts: SalesInvoiceReceipt[];
    details: ISalesInvoiceDetail[];
}
