import ISalesDetailRecord from "./ISalesDetailRecord";
import DataObject from "../general/DataObject";
import ISalesInvoiceDetail from "./ISalesInvoiceDetail";
import IFreightRecord from "../pos/IFreightRecord";
import Big from "big.js";

export default class SalesDetailRecord extends DataObject implements ISalesDetailRecord, IFreightRecord {
    stockGuid: string = "";
    locationGuid: string = "";
    taxGuid: string = "";
    freightGuid: string = "";
    itemNum: number = 0;
    qty: number = 1;
    unitPrice: number = 0;
    unitTax: number = 0;
    unitCostPrice: number = 0;
    unitDiscount: number = 0;
    unitDiscountTax: number = 0;
    unitSurcharge: number = 0;
    unitSurchargeTax: number = 0;
    parentUnitCost: number = 0;
    parentQtyModifier: number = 0;
    requestedCoverage: number = 0;
    unitCoverage: number = 0;
    description: string = '';
    shelf: string = "";
    nonStockItem: boolean = false;
    isFreight: boolean = false;
    isFreightFree: boolean = false;
    boxWeight: number = 0;
    boxesPerPallet: number = 0;
    salesOrderGuid: string = "";

    get unitPriceInc(): number {
        return Number(Big(this.unitPrice).plus(this.unitTax));
    }

    set unitPriceInc(value) {
        // we need the tax rate to do this
    }

    constructor(obj? : ISalesInvoiceDetail) {
        super();
        this.copy(obj);
    }

    copy(obj?: ISalesDetailRecord) {
        this.itemNum = obj && obj.itemNum || 0;
        this.description = obj && obj.description || "";
        this.stockGuid = obj && obj.stockGuid || "";
        this.locationGuid = obj && obj.locationGuid || "";
        this.taxGuid = obj && obj.taxGuid || "";
        this.shelf = obj && obj.shelf || "";
        this.qty = obj && obj.qty || 1;
        this.unitPrice = obj && obj.unitPrice || 0.00;
        this.unitTax = obj && obj.unitTax || 0.00;
        this.unitCostPrice = obj && obj.unitCostPrice || 0.00;
        this.unitDiscount = obj && obj.unitDiscount || 0.00;
        this.unitDiscountTax = obj && obj.unitDiscountTax || 0.00;
        this.unitSurcharge = obj && obj.unitSurcharge || 0.00;
        this.unitSurchargeTax = obj && obj.unitSurchargeTax || 0.00;
        this.salesOrderGuid = obj && obj.salesOrderGuid || "";
        this.parentUnitCost = obj && obj.parentUnitCost || 0.00;
        this.parentQtyModifier = obj && obj.parentQtyModifier || 0;
        this.nonStockItem = obj && obj.nonStockItem || false;
        this.requestedCoverage = obj && obj.requestedCoverage || 0;
        this.unitCoverage = obj && obj.unitCoverage || 0;
        this.isFreight = obj && obj.isFreight || false;
        this.isFreightFree = obj && obj.isFreightFree || false;
        this.freightGuid = obj && obj.freightGuid || '';
        this.boxWeight = obj && obj.boxWeight || 0.00;
        this.boxesPerPallet = obj && obj.boxesPerPallet || 0;
    }

    /**
     * This gets the weight of the line item
     */
    totalWeight() {
        return this.boxWeight * this.qty;
    }

    setPriceInc(price: number) : void {
        this.unitPrice = price;
    }
}
