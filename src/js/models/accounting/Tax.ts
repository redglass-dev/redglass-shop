import IDataObject from "../general/IDataObject";
import Big from "big.js"
import  uuid from "uuid-random";

interface ITax extends IDataObject {
    baseCodeGuid: string;
    description: string;
    code: string;
    baseTaxCode: string;
    glCodeGuid: string;
    rate: number;
    precedence: number;

    gstCode: string;
}

export default class Tax implements ITax {
    guid: string = '';
    baseCodeGuid: string = '';
    description: string = '';
    code: string = '';
    baseTaxCode: string = '';
    glCodeGuid: string = '';
    rate: number = 0.00;
    precedence: number = 0;
    gstCode: string = '';

    constructor(obj? : ITax) {
        this.update(obj);
    }

    split(value: any) {
        let results = { ex: 0.00, tax: 0.00 };
        //results.tax = Number(Big(value).times(this.rate).round(2, 2));
        //results.ex = Number(Big(value).sub(results.tax).round(2, 2));
        results.ex = Number(Big(value).div(1 + this.rate).round(2,2));
        results.tax = Number(Big(value).sub(results.ex).round(2,2));
        return results;
    }

    addTaxTo(value: any): number {
        let total = Big(value).mul(1 + this.rate).round(2, 2);
        return Number(total);
    }

    update(obj? : ITax) {
        this.guid = obj && obj.guid || uuid();
        this.baseCodeGuid = obj && obj.baseCodeGuid || '';
        this.description = obj && obj.description || '';
        this.code = obj && obj.code || '';
        this.baseTaxCode = obj && obj.baseTaxCode || '';
        this.glCodeGuid = obj && obj.glCodeGuid || '';
        this.rate = obj && Number(obj.rate) || 0.00;
        this.precedence = obj && Number(obj.precedence) || 0;
        this.gstCode = obj && obj.gstCode || '';
    }
}
