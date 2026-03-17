import IDataObject from "../general/IDataObject";
import  uuid from "uuid-random";

interface IStockCharacteristic extends IDataObject {
    name: string;
    description: string;
    orderBy: number;
    stockCharacteristicGroupGuid: string;
}

export default class StockCharacteristic implements IStockCharacteristic {
    description: string = '';
    guid: string = '';
    name: string = '';
    orderBy: number = 0;
    stockCharacteristicGroupGuid: string = '';

    constructor(obj? : IStockCharacteristic) {
        this.update(obj);
    }

    update(obj? : IStockCharacteristic) {
        this.guid = obj && obj.guid || uuid();
        this.name = obj && obj.name || '';
        this.description = obj && obj.description || '';
        this.orderBy = obj && obj.orderBy || 0;
        this.stockCharacteristicGroupGuid = obj && obj.stockCharacteristicGroupGuid || '';
    }
}
