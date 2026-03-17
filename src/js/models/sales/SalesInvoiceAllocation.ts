import IDataObject from "../general/IDataObject";
import  uuid from "uuid-random";
import ISalesInvoice from "./ISalesInvoice";

interface ISalesInvoiceAllocation extends IDataObject{
    salesInvoiceGuid: string;
    salesInvoiceReceiptGuid: string;
    transactionGuid: string;
    amount: number;
    lineAmount: string;
    extRefId: string;
}

export default class SalesInvoiceAllocation implements ISalesInvoiceAllocation{
    guid: string = '';
    amount: number = 0.00;
    salesInvoiceGuid: string = '';
    salesInvoiceReceiptGuid: string = '';
    lineAmount: string = '';
    transactionGuid: string = '';
    extRefId: string = '';

    constructor(obj? : ISalesInvoiceAllocation) {
        this.update(obj);
    }

    update(obj? : ISalesInvoiceAllocation) {
        this.guid = obj && obj.guid || uuid();
        this.amount = obj && obj.amount || 0.00;
        this.salesInvoiceGuid = obj && obj.salesInvoiceGuid || '';
        this.salesInvoiceReceiptGuid = obj && obj.salesInvoiceReceiptGuid || '';
        this.lineAmount = obj && obj.lineAmount || '';
        this.transactionGuid = obj && obj.transactionGuid || '';
        this.extRefId = obj && obj.extRefId || '';
    }
}
