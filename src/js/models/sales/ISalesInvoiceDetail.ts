import SalesInvoiceDetailCondiment from "./SalesInvoiceDetailCondiment";
import ISalesDetailRecord from "./ISalesDetailRecord";

export default interface ISalesInvoiceDetail extends ISalesDetailRecord {
    salesInvoiceGuid: string;
    userGuid: string;
    menuItemGuid: string;
    profileGuid: string;
    recipeDetailGuid: string;
    isCondiment: boolean;
    lineTotalEx: number;
    lineTotalInc: number;
    lineTotalTax: number;
    orderDate: string;
    salesOrderGuid: string;
    salesOrderDetailGuid: string;
    terminalGuid: string;
    branchGuid: string;
    tableGuid: string;
    jobTicketGuid: string;
    jobTicketAppointmentGuid: string;
    profilePrinter: string;
    profileName: string;
    editReason: string;
    orderText: string;
    messageGuid: string;
    seatNo: number;
    sortOrder: number;
    points: number;
    profileSortOrder: number;
    unitOriginalPrice: number;
    unitOriginalTax: number;
    voided: boolean;
    isPriceEdited: boolean;
    isRefund: boolean;
    isNew: boolean;
    invoiceDate: string;

    glSalesGuid: string;

    glGstGuid: string;
    glCogsGuid: string;
    glSohGuid: string;
    glDebtorBranchGuid: string;
    parentStockGuid: string;
    parentGuid: string;
    glLoyaltyGuid: string;
    glDeferredRevenueGuid: string;
    year: string;
    extRefId: string;
    accountCode: string;

    condiments: SalesInvoiceDetailCondiment[];
}
