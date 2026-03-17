import IDataObject from "../general/IDataObject";

export interface IBalances extends IDataObject{
    futureTotal: number;
    currentTotal: number;
    days30Total: number;
    days60Total: number;
    days90Total: number;
    total: number;
}

export default class Balances implements IBalances {
    currentTotal: number = 0.00;
    days30Total: number = 0.00;
    days60Total: number = 0.00;
    days90Total: number = 0.00;
    futureTotal: number = 0.00;
    guid: string = '';

    get total() {
        return Number(this.currentTotal) + Number(this.futureTotal) + Number(this.days90Total) + Number(this.days60Total)  + Number(this.days30Total);
    }

    constructor(obj? : IBalances) {
        this.update(obj);
    }

    update(obj? : IBalances) {
        this.guid = obj && obj.guid || '';
        this.currentTotal = obj && obj.currentTotal || 0.00;
        this.days30Total = obj && obj.days30Total || 0.00;
        this.days60Total = obj && obj.days60Total || 0.00;
        this.days90Total = obj && obj.days90Total || 0.00;
        this.futureTotal = obj && obj.futureTotal || 0.00;
    }
}

