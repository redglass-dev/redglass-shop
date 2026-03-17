import IDataObject from "../general/IDataObject";
import uuid from "uuid-random";
import Formatter from "../general/Formatter";
import SalesInvoiceAllocation from "./SalesInvoiceAllocation";
import {ICustomer} from "../contacts/Customer";

interface ISalesInvoiceReceipt extends IDataObject{
    receiptNum: number;
    userGuid: string;
    paymentTypeGuid: string;
    shiftGuid: string;
    customerGuid: string;
    accountGuid: string;
    receivedOnShiftGuid: string;
    terminalGuid: string;
    taxGuid: string;
    bankAccountGuid: string;
    cashbookTransactionGuid: string;
    salesInvoiceGuid: string;
    creditCardGuid: string;
    amount: number;
    taxAmount: number;
    cashReceived: number;
    changePaid: number;
    description: string;
    txnId: string;
    refId1: string;
    refId2: string;
    manualAccount: boolean;
    dateTime: string;
    trackingId: string;
    generalLedgerAccountGuid: string;
    glUndepositedReceiptGuid: string;
    glAccountGuid: string;
    glDeferredRevenueGuid: string;
    allocations: SalesInvoiceAllocation[];

    // syncWithWeb: boolean;
    // allocated: number;
    // extRefId: string;
    // accountCode: string;
    // export: boolean;
    // locked: boolean;

}

export default class SalesInvoiceReceipt implements ISalesInvoiceReceipt {
    guid: string = '';
    paymentTypeGuid: string = '';
    userGuid: string = '';
    shiftGuid: string = '';
    receivedOnShiftGuid: string = '';
    terminalGuid: string = '';
    bankAccountGuid: string = '';
    accountGuid: string = '';
    creditCardGuid: string = '';
    customerGuid: string = '';
    taxGuid: string = '';
    txnId: string = '';
    cashbookTransactionGuid: string = '';
    salesInvoiceGuid: string = '';
    description: string = '';
    refId1: string = '';
    refId2: string = '';
    amount: number = 0;
    taxAmount: number = 0;
    cashReceived: number = 0;
    changePaid: number = 0;
    manualAccount: boolean = false
    receiptNum: number = 0;
    trackingId: string = '';
    generalLedgerAccountGuid: string = '';
    glUndepositedReceiptGuid: string = '';
    glAccountGuid: string = '';
    glDeferredRevenueGuid: string = '';

    allocations: SalesInvoiceAllocation[] = [];

    private _allocated: number = 0;
    private _dateTime: Date = new Date();

    // @ts-ignore
    get dateTime() {

        // @ts-ignore
        return Formatter.formatDateForStorage(this._dateTime);
    }

    // @ts-ignore
    set dateTime(value: string| null | undefined) {
        // Let's set the date from a string
        if(!value || value === "null") {
            this._dateTime = new Date();
            return;
        }

        this._dateTime = Formatter.parse(value);
    }

    get allocated() {
        if(this.allocations.length > 0) {
            var total = 0.00;
            for(let key in this.allocations) {
                total += this.allocations[key].amount;
            }

            return total;
        }

        return this._allocated;
    }

    set allocated(value: number) {
        this._allocated = value;
    }

    constructor(obj? : ISalesInvoiceReceipt) {
        this.update(obj);
    }

    setCustomer(customer: ICustomer) {
        this.customerGuid = customer.guid;
        this.accountGuid = customer.accountGuid;
    }

    update(obj? : ISalesInvoiceReceipt) {
        this.guid = obj && obj.guid || uuid();
        this.paymentTypeGuid = obj && obj.paymentTypeGuid || '';
        this.userGuid = obj && obj.userGuid || '';
        this.shiftGuid = obj && obj.shiftGuid || '';
        this.receivedOnShiftGuid = obj && obj.receivedOnShiftGuid || '';
        this.terminalGuid = obj && obj.terminalGuid || '';
        this.bankAccountGuid = obj && obj.bankAccountGuid || '';
        this.accountGuid = obj && obj.accountGuid || '';
        this.creditCardGuid = obj && obj.creditCardGuid || '';
        this.customerGuid = obj && obj.customerGuid || '';
        this.taxGuid = obj && obj.taxGuid || '';
        this.txnId = obj && obj.txnId || '';
        this.cashbookTransactionGuid = obj && obj.cashbookTransactionGuid || '';
        this.salesInvoiceGuid = obj && obj.salesInvoiceGuid || '';
        this.description = obj && obj.description || '';
        this.refId1 = obj && obj.refId1 || '';
        this.refId2 = obj && obj.refId2 || '';
        this.amount = obj && obj.amount || 0.00;
        this.taxAmount = obj && obj.taxAmount || 0.00;
        this.cashReceived = obj && obj.cashReceived || 0.00;
        this.changePaid = obj && obj.changePaid || 0.00;
        this.manualAccount = obj && obj.manualAccount || false;

        this.receiptNum = obj && obj.receiptNum || 0.00;
        this.trackingId = obj && obj.trackingId || '';
        this.generalLedgerAccountGuid = obj && obj.generalLedgerAccountGuid || '';
        this.glUndepositedReceiptGuid = obj && obj.glUndepositedReceiptGuid || '';
        this.glAccountGuid = obj && obj.glAccountGuid || '';
        this.glDeferredRevenueGuid = obj && obj.glDeferredRevenueGuid || '';

        this.dateTime = obj && obj.dateTime;
    }

    // toJSON is automatically used by JSON.stringify
    toJSON(): ISalesInvoiceReceipt {
        // copy all fields from `this` to an empty object and return in
        let tmp = Object.assign({}, this, {
            // convert fields that need converting
            dateTime: this.dateTime,
        });

        // @ts-ignore
        tmp._dateTime = undefined;

        // @ts-ignore
        return tmp;
    }
}
