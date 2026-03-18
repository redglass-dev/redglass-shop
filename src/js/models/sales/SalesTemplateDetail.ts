import DataObject from "../general/DataObject";
import ISalesTemplate from "./ISalesTemplate";
import Big from "big.js";
import ISalesDetailRecord from "./ISalesDetailRecord";
import SalesDetailRecord from "./SalesDetailRecord";
import  uuid from "uuid-random";

interface ISalesTemplateDetail extends ISalesDetailRecord {
    salesTemplateGuid: string;
    unitTypeName: string;
    syncCounter: number;

    boxWeight: number;
    parentStockGuid: string;
    glSalesGuid: string;
    boxesPerPallet: number;
    freightGuid:string;
    isFreightFree: boolean;
    lineTotalEx: number;
    lineTotalInc: number;
    lineTotalTax: number;
}

export default class SalesTemplateDetail extends SalesDetailRecord implements ISalesTemplateDetail {
    guid: string = '';
    salesTemplateGuid: string = '';
    unitTypeName: string = '';
    syncCounter: number = 0;

    boxWeight: number = 0;
    boxesPerPallet: number = 0;
    parentStockGuid: string = '';
    glSalesGuid: string = '';
    freightGuid:string = '';
    isFreightFree: boolean = false;
    exportQty: number = 0;

    get unitPriceInc(): number {
        return Number(Big(this.unitPrice).plus(this.unitTax));
    }

    get lineTotalInc(): number {
       if(DataObject.isNumber(this.unitPrice) && DataObject.isNumber(this.exportQty)) {
            return Number(Big(this.unitPriceInc).times(this.exportQty));
       }

       return 0;
    }

    get lineTotalTax(): number {
       if(DataObject.isNumber(this.unitPrice) && DataObject.isNumber(this.exportQty)) {
            return Number(Big(this.unitTax).times(this.exportQty));
       }

       return 0;
    }

    get lineTotalEx(): number {
       if(DataObject.isNumber(this.unitPrice) && DataObject.isNumber(this.exportQty)) {
            return Number(Big(this.unitPrice).times(this.exportQty));
       }

       return 0;
    }

    get valueTotalInc(): number {
        return Number(Big(this.unitPriceInc).times(this.qty));
    }

    get valueTotalTax(): number {
        return Number(Big(this.unitTax).times(this.qty));
    }

    get valueTotalEx(): number {
        return Number(Big(this.unitPrice).times(this.qty));
    }

    constructor(obj? : ISalesTemplateDetail) {
        super();
        this.update(obj);
    }

    setTemplate(template: ISalesTemplate) {
        this.salesTemplateGuid = template.guid;
    }

    update(obj? : ISalesTemplateDetail) {
        this.guid = obj && obj.guid || uuid();
        this.salesTemplateGuid = obj && obj.salesTemplateGuid || '';
        this.unitTypeName = obj && obj.unitTypeName || '';
        this.syncCounter = obj && obj.syncCounter || 0.00;
        this.unitCostPrice = obj && obj.unitCostPrice || 0.00;
        this.parentStockGuid = obj && obj.parentStockGuid || '';
        this.boxWeight = obj && obj.boxWeight || 0;
        this.boxesPerPallet = obj && obj.boxesPerPallet || 0;
        this.parentStockGuid = obj && obj.parentStockGuid || '';
        this.glSalesGuid = obj && obj.glSalesGuid || '';
        this.freightGuid = obj && obj.freightGuid || '';
        this.isFreightFree = obj && obj.isFreightFree || false;

        this.copy(obj);
    }

    // toJSON is automatically used by JSON.stringify
    toJSON(): ISalesTemplateDetail {
        // copy all fields from `this` to an empty object and return in
        let tmp = Object.assign({}, this, {
            // convert fields that need converting
            unitPriceInc: this.unitPriceInc,
        });

        return tmp;
    }

}
