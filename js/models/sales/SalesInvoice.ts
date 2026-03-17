import SalesInvoiceAllocation from "./SalesInvoiceAllocation";
import SalesInvoiceDetail from "./SalesInvoiceDetail";
import SalesInvoiceReceipt from "./SalesInvoiceReceipt";
import ISalesInvoice, {DeliveryStatus, SalesInvoiceStatus} from "./ISalesInvoice";
import Formatter from "../general/Formatter";
import SalesRecord from "./SalesRecord";
import {PriceGroup} from "../general/PriceGroup";
import Customer from "../contacts/Customer";
import uuid from "uuid-random";
import Big from 'big.js'

export default class SalesInvoice extends SalesRecord implements ISalesInvoice {
    guid: string = uuid();
    userGuid: string = '';
    invoiceNum: number = 0;
    dataEntryUserGuid: string = '';
    jobTicketGuid: string = '';
    queGuid: string = '';
    shiftGuid: string = '';
    terminalGuid:string = '';
    tableGuid: string = '';
    salesOrderGuid: string = '';
    tableNum: string = '';
    deliveryRouteGuid: string = '';
    roomRef: string = '';
    loyaltyCardNo: string = '';
    deliveredStatus: DeliveryStatus = DeliveryStatus.None;
    status: SalesInvoiceStatus = SalesInvoiceStatus.Open;
    covers: number = 1;
    from: number = 1;
    fromApp: number = 1;
    printedToKitchen: boolean = false;
    pickup: boolean = true;
    delivery: boolean = false;
    printed: boolean = false;
    emailed: boolean = false;
    accountFromPos: boolean = false;
    fromAccounting: boolean = false;
    allocations: SalesInvoiceAllocation[] = [];
    details: SalesInvoiceDetail[] = [];
    receipts: SalesInvoiceReceipt[] = [];
    trackingId: number = 0;
    salesQuoteGuid: string = '';
    extRefId: string = '';
    export: boolean = false;
    amountPaid: number = 0.00;

    private _date: Date = new Date();
    private _requiredDate: Date = new Date();
    private _paymentDateTime: Date|null = null;
    private _kitchenPrintTime: Date|null = null;

    // @ts-ignore
    get date() {
        // @ts-ignore
        return Formatter.formatDateForStorage(this._date) ?? '';
    }

    // @ts-ignore
    set date(value: string|null|undefined) {
        // Let's set the date from a string
        if(!value ||value === "null") {
            this._date = new Date();
            return;
        }

        this._date = Formatter.parse(value);
    }

    get requiredDate() {
        // @ts-ignore
        return Formatter.formatDateForStorage(this._requiredDate);
    }

    set requiredDate(value: string) {
        // Let's set the date from a string
        if(!value || value === "null") {
            this._requiredDate = new Date();
            return;
        }

        this._requiredDate = Formatter.parse(value);
    }

    get paymentDateTime() {
        // @ts-ignore
        return this._paymentDateTime ? Formatter.formatDateForStorage(this._paymentDateTime) : null;
    }

    set paymentDateTime(value: string) {
        // Let's set the date from a string
        if(!value || value === "null") {
            this._paymentDateTime = null;
            return;
        }

        this._paymentDateTime = value ? Formatter.parse(value) : null;
    }

    get kitchenPrintTime() {
        // @ts-ignore
        return this._kitchenPrintTime ? Formatter.formatDateForStorage(this._kitchenPrintTime) : null;
    }

    set kitchenPrintTime(value: string) {
        // Let's set the date from a string
        if(!value ||value === "null") {
            this._kitchenPrintTime = null;
            return;
        }

        this._kitchenPrintTime = value ? Formatter.parse(value) : null;
    }

    get total(): number {
        var total = Big(0);
        for(let key in this.details) {
            total = total.plus(this.details[key].lineTotalInc)
        }

        return Number(total);
    }

    get totalEx(): number {
        var total = Big(0);
        for(let key in this.details) {
            total = total.plus(this.details[key].lineTotalEx)
        }

        return Number(total);
    }

    get totalTax(): number {
        var total = Big(0);
        for(let key in this.details) {
            total = total.plus(this.details[key].lineTotalTax)
        }

        return Number(total);
    }

    get outstanding(): number {
        var total = Big(0);
        for(let key in this.details) {
            total = total.plus(this.details[key].lineTotalInc)
        }

        for(let key in this.allocations) {
            total = total.minus(this.allocations[key].amount);
        }

        return Number(total);
    }

    set locked(value) {

    }

    get locked() {
        return this.status === SalesInvoiceStatus.Closed && this.export;
    }

    constructor(obj?: ISalesInvoice) {
        super();
        this.update(obj);
    }

    update(obj? : ISalesInvoice) {
        this.guid = obj && obj.guid || uuid();
        this.invoiceNum = obj && obj.invoiceNum || 0;
        this.userGuid = obj && obj.userGuid || '';
        this.dataEntryUserGuid = obj && obj.dataEntryUserGuid || '';
        this.jobTicketGuid = obj && obj.jobTicketGuid || '';
        this.queGuid = obj && obj.queGuid || '';
        this.shiftGuid = obj && obj.shiftGuid || '';
        this.terminalGuid = obj && obj.terminalGuid || '';
        this.tableGuid = obj && obj.tableGuid || '';
        this.salesOrderGuid = obj && obj.salesOrderGuid || '';
        this.salesQuoteGuid = obj && obj.salesQuoteGuid || '';
        this.tableNum = obj && obj.tableNum || '';
        this.deliveryRouteGuid = obj && obj.deliveryRouteGuid || '';
        this.status = obj && obj.status || SalesInvoiceStatus.Open;
        this.roomRef = obj && obj.roomRef || '';
        this.loyaltyCardNo = obj && obj.loyaltyCardNo || '';
        this.deliveredStatus = obj && obj.deliveredStatus || DeliveryStatus.None;
        this.covers = obj && obj.covers || 1;
        this.from = obj && obj.from || 1;
        this.fromApp = obj && obj.fromApp || 1;
        this.printedToKitchen = obj && obj.printedToKitchen || false;
        this.pickup = obj && obj.pickup || true;
        this.delivery = obj && obj.delivery || false;
        this.printed = obj && obj.printed || false;
        this.emailed = obj && obj.emailed || false;
        this.accountFromPos = obj && obj.accountFromPos || false;
        this.fromAccounting = obj && obj.fromAccounting || false;
        this.date = obj && obj.date;
        // @ts-ignore
        this.requiredDate = obj && obj.requiredDate;
        // @ts-ignore
        this.paymentDateTime = obj && obj.paymentDateTime || null;
        // @ts-ignore
        this.kitchenPrintTime = obj && obj.kitchenPrintTime || null;
        this.trackingId = obj && obj.trackingId || 0;
        this.extRefId = obj && obj.extRefId || '';
        this.export = obj && obj.export || false;
        this.locked = obj && obj.locked || false;
        this.amountPaid = obj && obj.amountPaid || 0.00;

        // @ts-ignore
        this.updateHeader(obj);

        if(obj && obj.allocations) {
            this.allocations = [];
            for(let key in obj.allocations) {
                this.allocations.push(new SalesInvoiceAllocation(obj.allocations[key]));
            }
        }

        if(obj && obj.receipts) {
            this.receipts = [];
            for(let key in obj.receipts) {
                // @ts-ignore
                this.receipts.push(new SalesInvoiceReceipt(obj.receipts[key]));
            }
        }

        if(obj && obj.details) {
            this.details = [];
            for(let key in obj.details) {
                if(!obj.details[key].isCondiment) {
                    this.details.push(new SalesInvoiceDetail(obj.details[key]));
                }
            }
        }
    }

    // toJSON is automatically used by JSON.stringify
    toJSON(): ISalesInvoice {
        // copy all fields from `this` to an empty object and return in
        let tmp = Object.assign({}, this, {
            // convert fields that need converting
            date: this.date,
            requiredDate: this.requiredDate,
            kitchenPrintTime: this.kitchenPrintTime,
            paymentDateTime: this.paymentDateTime,
        });

        // @ts-ignore
        tmp._date = undefined;
        // @ts-ignore
        tmp._kitchenPrintTime = undefined;
        // @ts-ignore
        tmp._requiredDate = undefined;
        // @ts-ignore
        tmp._paymentDateTime = undefined;

        // @ts-ignore
        return tmp;
    }
}
