import DataObject from "../general/DataObject";

export default interface ISalesDetailRecord extends DataObject {
    stockGuid: string;
    locationGuid: string;

    description: string;
    qty: number;
    unitPrice: number;
    unitTax: number;
    unitCostPrice: number;
    parentUnitCost: number;
    parentQtyModifier: number;
    taxGuid: string;
    unitDiscount: number;
    unitSurcharge: number;
    unitDiscountTax: number;
    unitSurchargeTax: number;
    itemNum: number;
    shelf: string;
    requestedCoverage: number;
    unitCoverage: number;
    nonStockItem: boolean;

    salesOrderGuid: string;
    unitPriceInc: number;
}
