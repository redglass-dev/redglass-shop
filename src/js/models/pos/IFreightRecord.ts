export default interface IFreightRecord {
    isFreight: boolean;
    isFreightFree: boolean;
    freightGuid: string;
    boxWeight: number;
    boxesPerPallet: number;
    qty: number;
    stockGuid: string;
    unitPriceInc: number;
    unitTax: number;
    unitCostPrice: number;
    locationGuid: string;
    nonStockItem: boolean;
    description: string;
    taxGuid: string;

    setPriceInc(value: number) : void;
}
