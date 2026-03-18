import ISalesTemplate from "./ISalesTemplate";
import SalesRecord from "./SalesRecord";
import  uuid from "uuid-random";

export default class SalesTemplate extends SalesRecord implements ISalesTemplate {
    guid: string = '';

    name: string = '';
    deliveryRouteGuid: string = '';
    syncCounter: number = 0;
    detailSyncCounter: number = 0;
    totalValue: number = 0;
    useCurrentStockPrices: boolean = false;

    constructor(obj? : ISalesTemplate) {
        super();
        this.update(obj);
    }

    update(obj? : ISalesTemplate) {
        this.guid = obj && obj.guid || uuid();
        this.name = obj && obj.name || '';
        this.updateHeader(obj);

        this.deliveryRouteGuid = obj && obj.deliveryRouteGuid || '';
        this.syncCounter = obj && obj.syncCounter || 0.00;
        this.detailSyncCounter = obj && obj.detailSyncCounter || 0.00;
        this.totalValue = obj && obj.totalValue || 0.00;
        this.useCurrentStockPrices = obj && obj.useCurrentStockPrices || false;
    }
}
