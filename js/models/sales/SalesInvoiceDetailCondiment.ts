import IDataObject from "../general/IDataObject";
import  uuid from "uuid-random";
import SalesInvoiceDetail from "./SalesInvoiceDetail";

interface ISalesInvoiceDetailCondiment extends IDataObject{
    salesInvoiceDetailGuid: string;
    condimentGuid: string;
    qty: number;
    name: string;
    recordSalesInvoiceDetailGuid: string;
    salesInvoiceGuid: string;
    orderBy: number;
    condimentGroupGuid: string;
    voided: boolean;
    printColor: string;

    record_invoice_detail: SalesInvoiceDetail|null;
}

export default class SalesInvoiceDetailCondiment implements ISalesInvoiceDetailCondiment{
    guid: string = '';
    condimentGuid: string = '';
    condimentGroupGuid: string = '';
    salesInvoiceGuid: string = '';
    salesInvoiceDetailGuid: string = '';
    recordSalesInvoiceDetailGuid: string = '';
    name: string = '';
    printColor: string = '';
    orderBy: number = 0;
    qty: number = 1;
    voided: boolean = false;
    record_invoice_detail: SalesInvoiceDetail|null = null;

    constructor(obj? : ISalesInvoiceDetailCondiment) {
        this.update(obj);
    }

    update(obj? : ISalesInvoiceDetailCondiment) {
        this.guid = obj && obj.guid || uuid();
        this.condimentGuid = obj && obj.condimentGuid || '';
        this.condimentGroupGuid = obj && obj.condimentGroupGuid || '';
        this.salesInvoiceGuid = obj && obj.salesInvoiceGuid || '';
        this.salesInvoiceDetailGuid = obj && obj.salesInvoiceDetailGuid || '';
        this.recordSalesInvoiceDetailGuid = obj && obj.recordSalesInvoiceDetailGuid || '';
        this.name = obj && obj.name || '';
        this.printColor = obj && obj.printColor || '';
        this.orderBy = obj && obj.orderBy || 0.00;
        this.qty = obj && obj.qty || 0.00;
        this.voided = obj && obj.voided || false;

        if(obj && obj.record_invoice_detail) {
            this.record_invoice_detail = new SalesInvoiceDetail(obj.record_invoice_detail);
        }
    }
}
