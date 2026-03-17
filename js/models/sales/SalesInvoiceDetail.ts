import ISalesInvoice from "./ISalesInvoice";
import ISalesInvoiceDetail from "./ISalesInvoiceDetail";
import Big from "big.js";
import  uuid from "uuid-random";
import Formatter from "../general/Formatter";
import SalesInvoiceDetailCondiment from "./SalesInvoiceDetailCondiment";
import SalesDetailRecord from "./SalesDetailRecord";

export default class SalesInvoiceDetail extends SalesDetailRecord implements ISalesInvoiceDetail {
    salesInvoiceGuid: string = '';
    userGuid: string = '';
    terminalGuid: string = '';
    branchGuid: string = '';
    tableGuid: string = '';
    messageGuid: string = '';
    menuItemGuid: string = '';
    sortOrder: number = 0;
    profileGuid: string = '';
    salesOrderDetailGuid: string = '';
    salesOrderGuid: string = '';
    recipeDetailGuid: string = '';
    jobTicketGuid: string = '';
    jobTicketAppointmentGuid: string = '';
    points: number = 0;
    profileSortOrder: number = 0;
    seatNo: number = 0;
    unitOriginalPrice: number = 0;
    unitOriginalTax: number = 0;
    profilePrinter: string = '';
    profileName: string = '';
    editReason: string = '';
    orderText: string = '';
    voided: boolean = false;
    isCondiment: boolean = false;
    isPriceEdited: boolean = false;
    isRefund: boolean = false;
    isNew: boolean = false;
    glSalesGuid: string = '';
    glGstGuid: string = '';
    glCogsGuid: string = '';
    glSohGuid: string = '';
    glDebtorBranchGuid: string = '';
    parentStockGuid: string = '';
    parentGuid: string = '';
    glLoyaltyGuid: string = '';
    glDeferredRevenueGuid: string = '';
    year: string = '';
    extRefId: string = '';
    accountCode: string = '';

    condiments: SalesInvoiceDetailCondiment[] = [];

    private _dateTime: Date = new Date();
    private _invoiceDate: Date = new Date();

    get orderDate(): string {
        return Formatter.formatDateForStorage(this._dateTime) ?? '';
    }

    set orderDate(value: string|null|undefined) {
        // Let's set the date from a string
        if(!value || value === "null") {
            this._dateTime = new Date();
            return;
        }

        this._dateTime = Formatter.parse(value);
    }

    get invoiceDate(): string {
        return Formatter.formatDateForStorage(this._invoiceDate) ?? '';
    }

    set invoiceDate(value: string|null|undefined) {
        // Let's set the date from a string
        if(!value || value === "null") {
            this._invoiceDate = new Date();
            return;
        }

        this._invoiceDate = Formatter.parse(value);
    }

    get lineTotalInc(): number {
        return Number(Big(this.unitPriceInc).times(this.qty).plus(this.getCondimentsTotalInc()));
    }

    get lineTotalTax(): number {
        return Number(Big(this.unitTax).times(this.qty).plus(this.getCondimentsTotalTax()));
    }

    get lineTotalEx(): number {
        return Number(Big(this.unitPrice).times(this.qty).plus(this.getCondimentsTotalEx()));
    }

    constructor(obj? : ISalesInvoiceDetail) {
        super();
        this.update(obj);
    }

    getCondimentsTotalTax(): number {
        var total = new Big(0);
        for(let key in this.condiments) {
            if(this.condiments[key].recordSalesInvoiceDetailGuid !== '' && this.condiments[key].record_invoice_detail) {
                total = total.plus(this.condiments[key].record_invoice_detail.lineTotalTax);
            }
        }

        return Number(total);
    }

    getCondimentsTotalEx(): number {
        var total = new Big(0);
        for(let key in this.condiments) {
            if(this.condiments[key].recordSalesInvoiceDetailGuid !== '' && this.condiments[key].record_invoice_detail) {
                total = total.plus(this.condiments[key].record_invoice_detail.lineTotalEx);
            }
        }

        return Number(total);
    }

    getCondimentsTotalInc(): number {
        var total = new Big(0);
        for(let key in this.condiments) {
            if(this.condiments[key].recordSalesInvoiceDetailGuid !== '' && this.condiments[key].record_invoice_detail) {
                total = total.plus(this.condiments[key].record_invoice_detail.lineTotalInc);
            }
        }

        return Number(total);
    }

    setInvoice(invoice: ISalesInvoice) {
        this.invoiceDate = invoice.date;
        this.salesInvoiceGuid = invoice.guid;
        this.terminalGuid = invoice.terminalGuid;
        this.branchGuid = invoice.branchGuid;
        this.userGuid = invoice.userGuid;
    }

    update(obj? : ISalesInvoiceDetail) {
        this.guid = obj && obj.guid || uuid();
        this.salesInvoiceGuid = obj && obj.salesInvoiceGuid || '';
        this.userGuid = obj && obj.userGuid || '';
        this.profileGuid = obj && obj.profileGuid || '';
        this.terminalGuid = obj && obj.terminalGuid || '';
        this.branchGuid = obj && obj.branchGuid || '';
        this.tableGuid = obj && obj.tableGuid || '';
        this.menuItemGuid = obj && obj.menuItemGuid || '';
        this.salesOrderGuid = obj && obj.salesOrderGuid || '';
        this.recipeDetailGuid = obj && obj.recipeDetailGuid || '';
        this.jobTicketGuid = obj && obj.jobTicketGuid || '';
        this.jobTicketAppointmentGuid = obj && obj.jobTicketAppointmentGuid || '';
        this.profilePrinter = obj && obj.profilePrinter || '';
        this.profileName = obj && obj.profileName || '';
        this.editReason = obj && obj.editReason || '';
        this.orderText = obj && obj.orderText || '';
        this.messageGuid = obj && obj.messageGuid || '';
        this.seatNo = obj && obj.seatNo || 0;
        this.sortOrder = obj && obj.sortOrder || 0;
        this.points = obj && obj.points || 0;
        this.profileSortOrder = obj && obj.profileSortOrder || 0;
        this.unitOriginalPrice = obj && obj.unitOriginalPrice || 0.00;
        this.unitOriginalTax = obj && obj.unitOriginalTax || 0.00;
        this.voided = obj && obj.voided || false;
        this.isCondiment = obj && obj.isCondiment || false;
        this.isPriceEdited = obj && obj.isPriceEdited || false;
        this.isRefund = obj && obj.isRefund || false;
        this.isNew = obj && obj.isNew || false;
        this.orderDate = obj && obj.orderDate;
        this.invoiceDate = obj && obj.invoiceDate;

        this.glSalesGuid = obj && obj.glSalesGuid || '';

        this.glGstGuid = obj && obj.glGstGuid || '';
        this.glCogsGuid = obj && obj.glCogsGuid || '';
        this.glSohGuid = obj && obj.glSohGuid || '';
        this.glDebtorBranchGuid = obj && obj.glDebtorBranchGuid || '';
        this.parentStockGuid = obj && obj.parentStockGuid || '';
        this.parentGuid = obj && obj.parentGuid || '';
        this.glLoyaltyGuid = obj && obj.glLoyaltyGuid || '';
        this.glDeferredRevenueGuid = obj && obj.glDeferredRevenueGuid || '';
        this.year = obj && obj.year || '';
        this.extRefId = obj && obj.extRefId || '';
        this.accountCode = obj && obj.accountCode || '';

        this.copy(obj);

        if(obj && obj.condiments) {
            this.condiments = [];
            for(let key in obj.condiments) {
                this.condiments.push(new SalesInvoiceDetailCondiment(obj.condiments[key]));
            }
        }
    }

    // toJSON is automatically used by JSON.stringify
    toJSON(): ISalesInvoiceDetail {
        // copy all fields from `this` to an empty object and return in
        let tmp = Object.assign({}, this, {
            // convert fields that need converting
            dateTime: this.orderDate,
            invoiceDate: this.invoiceDate,
            unitPriceInc: this.unitPriceInc,
        });

        // @ts-ignore
        delete tmp._invoiceDate;
        // @ts-ignore
        delete tmp._dateTime;

        return tmp;
    }
}
