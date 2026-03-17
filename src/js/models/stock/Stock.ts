import IDataObject from "../general/IDataObject";
import Tax from '../accounting/Tax';
import {PriceGroup} from "../general/PriceGroup";
import Big from "big.js"
import uuid from "uuid-random";
import StockCharacteristic from "./StockCharacteristic";
// @ts-ignore
import UnitType from "./UnitType";

export enum StockType {
    Stock = 1,
    Child = 2,
    Recipe = 4,
    MenuItem = 8
}

export enum StockCoverageType {
    surfaceArea = 1,
    lengthCoverage = 2,
    widthCoverage = 4
}

export interface IStock extends IDataObject {
    type: StockType;
    plu: string;
    stockDescription: string;
    stockGroupGuid: string;
    manufacturerGuid: string;
    unitTypeGuid: string;
    purchaseTaxGuid: string;
    taxGuid: string;
    parentGuid: string;
    parentQtyModifier: number;
    defaultLocationGuid: string;
    defaultStockSupplierGuid: string;
    defaultSupplierGuid: string;
    defaultSupplierPartNo: number;
    options: string;
    orderText: string;
    recommendations: string;
    stockCodeDescription: string;
    notes: string;
    manufacturerDescription: string;
    webDescription: string;
    countDown: boolean;
    countDownStart: number;
    countDownWarning: number;
    loyaltyPerItem: number;
    loyaltyCost: number;
    boxesPerPallet: number;
    qtyInBox: number;
    boxWeight: number;
    maxDiscount: number;
    surfaceArea: number;
    lengthCoverage: number;
    widthCoverage: number;
    freightItemGuid: string;
    deliveryTime: number;
    minLevel: number;
    reOrderLevel: number;
    lastPurchaseEx: number;
    lastPurchaseTax: number;
    costEx: number;
    costTax: number;
    retailEx: number;
    retailTax: number;
    wholeSaleEx: number;
    wholeSaleTax: number;
    p1Ex: number;
    p1Tax: number;
    p2Ex: number;
    p2Tax: number;
    p3Ex: number;
    p3Tax: number;
    p4Ex: number;
    p4Tax: number;
    p5Ex: number;
    p5Tax: number;
    p6Ex: number;
    p6Tax: number;
    p7Ex: number;
    p7Tax: number;
    p8Ex: number;
    p8Tax: number;
    p9Ex: number;
    p9Tax: number;
    p10Ex: number;
    p10Tax: number;
    saleEx: number;
    saleTax: number;
    specialEx: number;
    specialTax: number;
    retailFunc: string;
    wholesaleFunc: string;
    p1Func: string;
    p2Func: string;
    p3Func: string;
    p4Func: string;
    p5Func: string;
    p6Func: string;
    p7Func: string;
    p8Func: string;
    p9Func: string;
    p10Func: string;
    saleFunc: string;
    specialFunc: string;
    onSale: boolean;
    onSpecial: boolean;
    nonStockItem: boolean;
    unAvailable: boolean;
    hasImages: boolean;
    hideFromWeb: boolean;
    discountSyncCounter: number;
    defaultCoverageType: StockCoverageType;
    accountEx: number;
    accountTax: number;
    parent: Stock|null;
    recipeGuid: string;
    glTaxSalesGuid: string;
    glTaxPurchasesGuid: string;
    glCogsGuid: string;
    glStockGuid: string;
    glAdjustGuid: string;
    glSurchargeGuid: string;
    glDiscountGuid: string;
    glSalesGuid: string;
    stockDisplayGroupGuid: string;
    orderBy: number;
    wideImage: any;
    images: string[];
    characteristics: StockCharacteristic[];
    width: number;
    height: number;
    length: number;
    unavailableLabel: string;
    unitType: UnitType|null;
}

export default class Stock implements IStock {
    guid: string = '';
    manufacturerGuid: string = '';
    plu: string = '';
    stockGroupGuid: string = '';
    unitTypeGuid: string = '';
    purchaseTaxGuid: string = '';
    taxGuid: string = '';
    parentGuid: string = '';
    defaultLocationGuid: string = '';
    defaultStockSupplierGuid: string = '';
    defaultSupplierGuid: string = '';
    stockDescription: string = '';
    options: string = '';
    orderText: string = '';
    recommendations: string = '';
    stockCodeDescription: string = '';
    notes: string = '';
    manufacturerDescription: string = '';
    webDescription: string = '';
    type: StockType = StockType.Stock;
    boxesPerPallet: number = 0;
    countDownStart: number = 0;
    countDownWarning: number = 0;
    loyaltyPerItem: number = 0;
    loyaltyCost: number = 0;
    qtyInBox: number = 0;
    discountSyncCounter: number = 0;
    boxWeight: number = 0;
    maxDiscount: number = 0;
    parentQtyModifier: number = 0;
    defaultSupplierPartNo: number = 0;
    countDown: boolean = false;
    nonStockItem: boolean = false;
    unAvailable: boolean = false;
    hasImages: boolean = false;
    hideFromWeb: boolean = false;
    deliveryTime: number = 0;
    minLevel: number = 0;
    reOrderLevel: number = 0;
    lastPurchaseEx: number = 0;
    lastPurchaseTax: number = 0;
    costTax: number = 0;
    retailEx: number = 0;
    retailTax: number = 0;
    wholeSaleEx: number = 0;
    wholeSaleTax: number = 0;
    p1Ex: number = 0;
    p1Tax: number = 0;
    p2Ex: number = 0;
    p2Tax: number = 0;
    p3Ex: number = 0;
    p3Tax: number = 0;
    p4Ex: number = 0;
    p4Tax: number = 0;
    p5Ex: number = 0;
    p5Tax: number = 0;
    p6Ex: number = 0;
    p6Tax: number = 0;
    p7Ex: number = 0;
    p7Tax: number = 0;
    p8Ex: number = 0;
    p8Tax: number = 0;
    p9Ex: number = 0;
    p9Tax: number = 0;
    p10Ex: number = 0;
    p10Tax: number = 0;
    saleEx: number = 0;
    saleTax: number = 0;
    specialEx: number = 0;
    specialTax: number = 0;
    retailFunc: string = '';
    wholesaleFunc: string = '';
    p1Func: string = '';
    p2Func: string = '';
    p3Func: string = '';
    p4Func: string = '';
    p5Func: string = '';
    p6Func: string = '';
    p7Func: string = '';
    p8Func: string = '';
    p9Func: string = '';
    p10Func: string = '';
    specialFunc: string = '';
    saleFunc: string = '';
    onSale: boolean = false;
    onSpecial: boolean = false;
    accountEx: number = 0;
    accountTax: number = 0;
    surfaceArea: number = 0;
    lengthCoverage: number = 0;
    widthCoverage: number = 0;
    defaultCoverageType: StockCoverageType = StockCoverageType.surfaceArea;
    freightItemGuid: string = '';
    parent: Stock|null = null;
    wideImage: any = '';
    stockDisplayGroupGuid: string = '';
    orderBy: number = 0;
    characteristics: StockCharacteristic[] = [];
    width: number = 0;
    height: number = 0;
    length: number = 0;
    unavailableLabel: string = '';
    unitType: UnitType|null = null;

    tax: Tax|null = null;

    recipeGuid: string = '';
    glTaxSalesGuid: string = '';
    glTaxPurchasesGuid: string = '';
    glCogsGuid: string = '';
    glStockGuid: string = '';
    glAdjustGuid: string = '';
    glSurchargeGuid: string = '';
    glDiscountGuid: string = '';
    glSalesGuid: string = '';

    images: string[] = [];

    private _costEx: number = 0;

    get retailInc(): number {
        return this.unitPriceInc(PriceGroup.Retail);
    }

    set retailInc(value) {
        this.setUnitPriceInc(value);
    }

    get wholeSaleInc(): number {
        return this.unitPriceInc(PriceGroup.Wholesale);
    }

    set wholeSaleInc(value) {
        this.setUnitPriceInc(value, PriceGroup.Wholesale);
    }

    get p1Inc(): number {
        return this.unitPriceInc(PriceGroup.Price1);
    }

    set p1Inc(value) {
        this.setUnitPriceInc(value, PriceGroup.Price1);
    }

    get p2Inc(): number {
        return this.unitPriceInc(PriceGroup.Price2);
    }

    set p2Inc(value) {
        this.setUnitPriceInc(value, PriceGroup.Price2);
    }

    get p3Inc(): number {
        return this.unitPriceInc(PriceGroup.Price3);
    }

    set p3Inc(value) {
        this.setUnitPriceInc(value, PriceGroup.Price3);
    }

    get p4Inc(): number {
        return this.unitPriceInc(PriceGroup.Price4);
    }

    set p4Inc(value) {
        this.setUnitPriceInc(value, PriceGroup.Price4);
    }

    get saleInc(): number {
        return this.unitPriceInc(PriceGroup.Sale);
    }

    set saleInc(value) {
        this.setUnitPriceInc(value, PriceGroup.Sale);
    }

    get specialInc(): number {
        // Get Special price.
        return Number(Big(this.specialEx).plus(this.specialTax).round(2, 2));
    }

    set specialInc(value) {
        // This set special price.
        this.setUnitPriceInc(value, PriceGroup.Special);
    }

    get accountInc()  {
        return Number(Big(this.accountEx).plus(this.accountTax).round(2, 2));
    }

    get costInc() {
        return Number(Big(this.costEx).plus(this.costTax).round(2, 2));
    }

    get lastPurchaseInc() {
        return Number(Big(this.lastPurchaseEx).plus(this.lastPurchaseTax).round(2, 2));
    }

    set costEx(value) {
        if(this.type === StockType.Child && this.parent !== null) {
            return;
        }

        this._costEx = value;
    }

    // @ts-ignore
    get costEx() {
        if(this.type === StockType.Child && this.parent !== null) {
            return Number(new Big(1).div(this.parentQtyModifier).mul(this.parent.costEx).round(2, Big.roundHalfEven));
            //return Number(new Big(this.parent.costEx).mul(this.parentQtyModifier));
        }

        return this._costEx;
    }

    get defaultCoverage(): number {
        switch (this.defaultCoverageType)
        {
            case StockCoverageType.surfaceArea: return this.surfaceArea;
            case StockCoverageType.lengthCoverage: return this.lengthCoverage;
            case StockCoverageType.widthCoverage: return this.widthCoverage;
        }

        return 0.00;
    }

    constructor(obj?: IStock) {
        this.update(obj);
    }

    unitPriceEx(priceGroup: PriceGroup): number {
        // if(this.onSale) {
        //     return this.saleEx;
        // } else if (this.onSpecial) {
        //     return this.specialEx;
        // }

        switch (priceGroup) {
            case PriceGroup.None: return this.retailEx;
            case PriceGroup.Retail: return this.retailEx;
            case PriceGroup.Wholesale: return this.wholeSaleEx;
            case PriceGroup.Price1: return this.p1Ex;
            case PriceGroup.Price2: return this.p2Ex;
            case PriceGroup.Price3: return this.p3Ex;
            case PriceGroup.Price4: return this.p4Ex;
            case PriceGroup.Price5: return this.p5Ex;
            case PriceGroup.Price6: return this.p6Ex;
            case PriceGroup.Price7: return this.p7Ex;
            case PriceGroup.Price8: return this.p8Ex;
            case PriceGroup.Price9: return this.p9Ex;
            case PriceGroup.Price10: return this.p10Ex;
            case PriceGroup.Special: return this.specialEx;
            case PriceGroup.Sale: return this.saleEx;
            case PriceGroup.UseTerminal: return this.retailEx;
            case PriceGroup.FromAccount: return this.accountEx;
        }

        // Lets return nothing
        return 0;
    }

    unitPriceTax(priceGroup: PriceGroup): number {
        // if(this.onSale) {
        //     return this.saleTax;
        // } else if (this.onSpecial) {
        //     return this.specialTax;
        // }

        switch (priceGroup) {
            case PriceGroup.None: return this.retailTax;
            case PriceGroup.Retail: return this.retailTax;
            case PriceGroup.Wholesale: return this.wholeSaleTax;
            case PriceGroup.Price1: return this.p1Tax;
            case PriceGroup.Price2: return this.p2Tax;
            case PriceGroup.Price3: return this.p3Tax;
            case PriceGroup.Price4: return this.p4Tax;
            case PriceGroup.Price5: return this.p5Tax;
            case PriceGroup.Price6: return this.p6Tax;
            case PriceGroup.Price7: return this.p7Tax;
            case PriceGroup.Price8: return this.p8Tax;
            case PriceGroup.Price9: return this.p9Tax;
            case PriceGroup.Price10: return this.p10Tax;
            case PriceGroup.Sale: return this.saleTax;
            case PriceGroup.Special: return this.specialTax;
            case PriceGroup.UseTerminal: return this.retailTax;
            case PriceGroup.FromAccount: return this.accountTax;
        }

        // Lets return nothing
        return 0;
    }

    unitPriceInc(priceGroup: PriceGroup): number {
        return Number(Big(this.unitPriceEx(priceGroup)).plus(this.unitPriceTax(priceGroup)).round(2, 2));
    }

    setUnitPriceInc(value: number, priceGroup: PriceGroup = PriceGroup.Retail) {
        if(this.tax === null || typeof this.tax === "undefined") {
            switch (priceGroup) {
                case PriceGroup.None: this.retailEx = value; break;
                case PriceGroup.Retail: this.retailEx = value; break;
                case PriceGroup.Wholesale: this.wholeSaleEx = value; break;
                case PriceGroup.Price1: this.p1Ex = value; break;
                case PriceGroup.Price2: this.p2Ex = value; break;
                case PriceGroup.Price3: this.p3Ex = value; break;
                case PriceGroup.Price4: this.p4Ex = value; break;
                case PriceGroup.Price5: this.p5Ex = value; break;
                case PriceGroup.Price6: this.p6Ex = value; break;
                case PriceGroup.Price7: this.p7Ex = value; break;
                case PriceGroup.Price8: this.p8Ex = value; break;
                case PriceGroup.Price9: this.p9Ex = value; break;
                case PriceGroup.Price10: this.p10Ex = value; break;
                case PriceGroup.Sale: this.saleEx = value; break;
                case PriceGroup.Special: this.specialEx = value; break;
                case PriceGroup.UseTerminal: this.retailEx = value; break;
            }

            return;
        }

        let results = this.tax.split(value);
        switch (priceGroup) {
            case PriceGroup.None: this.retailEx = results.ex; this.retailTax = results.tax; break;
            case PriceGroup.Retail: this.retailEx = results.ex; this.retailTax = results.tax; break;
            case PriceGroup.Wholesale: this.wholeSaleEx = results.ex; this.wholeSaleTax = results.tax; break;
            case PriceGroup.Price1: this.p1Ex = results.ex; this.p1Tax = results.tax; break;
            case PriceGroup.Price2: this.p2Ex = results.ex; this.p2Tax = results.tax; break;
            case PriceGroup.Price3: this.p3Ex = results.ex; this.p3Tax = results.tax; break;
            case PriceGroup.Price4: this.p4Ex = results.ex; this.p4Tax = results.tax; break;
            case PriceGroup.Price5: this.p5Ex = results.ex; this.p5Tax = results.tax; break;
            case PriceGroup.Price6: this.p6Ex = results.ex; this.p6Tax = results.tax; break;
            case PriceGroup.Price7: this.p7Ex = results.ex; this.p7Tax = results.tax; break;
            case PriceGroup.Price8: this.p8Ex = results.ex; this.p8Tax = results.tax; break;
            case PriceGroup.Price9: this.p9Ex = results.ex; this.p9Tax = results.tax; break;
            case PriceGroup.Price10: this.p10Ex = results.ex; this.p10Tax = results.tax; break;
            case PriceGroup.Sale: this.saleEx = results.ex; this.saleTax = results.tax; break;
            case PriceGroup.Special: this.specialEx = results.ex; this.specialTax = results.tax; break;
            case PriceGroup.UseTerminal: this.retailEx = results.ex; this.retailTax = results.tax; break;
        }
    }

    update(obj? : IStock) {
        this.guid = obj && obj.guid || uuid();
        this.manufacturerGuid = obj && obj.manufacturerGuid || '';
        this.plu = obj && obj.plu || '';
        this.stockGroupGuid = obj && obj.stockGroupGuid || '';
        this.unitTypeGuid = obj && obj.unitTypeGuid || '';
        this.purchaseTaxGuid = obj && obj.purchaseTaxGuid || '';
        this.taxGuid = obj && obj.taxGuid || '';
        this.parentGuid = obj && obj.parentGuid || '';
        this.defaultLocationGuid = obj && obj.defaultLocationGuid || '';
        this.defaultStockSupplierGuid = obj && obj.defaultStockSupplierGuid || '';
        this.defaultSupplierGuid = obj && obj.defaultSupplierGuid || '';
        this.stockDescription = obj && obj.stockDescription || '';
        this.options = obj && obj.options || '';
        this.orderText = obj && obj.orderText || '';
        this.recommendations = obj && obj.recommendations || '';
        this.stockCodeDescription = obj && obj.stockCodeDescription || '';
        this.notes = obj && obj.notes || '';
        this.manufacturerDescription = obj && obj.manufacturerDescription || '';
        this.webDescription = obj && obj.webDescription || '';
        this.type = obj && obj.type || StockType.Stock;
        this.boxesPerPallet = obj && obj.boxesPerPallet || 0;
        this.countDownStart = obj && obj.countDownStart || 0;
        this.countDownWarning = obj && obj.countDownWarning || 0;
        this.loyaltyPerItem = obj && obj.loyaltyPerItem || 0;
        this.loyaltyCost = obj && obj.loyaltyCost || 0;
        this.qtyInBox = obj && obj.qtyInBox || 0;
        this.discountSyncCounter = obj && obj.discountSyncCounter || -1;
        this.boxWeight = obj && obj.boxWeight || 0;
        this.maxDiscount = obj && obj.maxDiscount || 0;
        this.parentQtyModifier = obj && obj.parentQtyModifier || 1;
        this.defaultSupplierPartNo = obj && obj.defaultSupplierPartNo || 0;
        this.countDown = obj && obj.countDown || false;
        this.nonStockItem = obj && obj.nonStockItem || false;
        this.unAvailable = obj && obj.unAvailable || false;
        this.hasImages = obj && obj.hasImages || false;
        this.hideFromWeb = obj && obj.hideFromWeb || false;
        this.deliveryTime = obj && obj.deliveryTime || 0;
        this.minLevel = obj && obj.minLevel || 0;
        this.reOrderLevel = obj && obj.reOrderLevel || 0;
        this.lastPurchaseEx = obj && obj.lastPurchaseEx || 0;
        this.lastPurchaseTax = obj && obj.lastPurchaseTax || 0;
        this.costEx = obj && obj.costEx || 0;
        this.costTax = obj && obj.costTax || 0;
        this.retailEx = obj && obj.retailEx || 0;
        this.retailTax = obj && obj.retailTax || 0;
        this.wholeSaleEx = obj && obj.wholeSaleEx || 0;
        this.wholeSaleTax = obj && obj.wholeSaleTax || 0;
        this.p1Ex = obj && obj.p1Ex || 0;
        this.p1Tax = obj && obj.p1Tax || 0;
        this.p2Ex = obj && obj.p2Ex || 0;
        this.p2Tax = obj && obj.p2Tax || 0;
        this.p3Ex = obj && obj.p3Ex || 0;
        this.p3Tax = obj && obj.p3Tax || 0;
        this.p4Ex = obj && obj.p4Ex || 0;
        this.p4Tax = obj && obj.p4Tax || 0;
        this.p5Ex = obj && obj.p5Ex || 0;
        this.p5Tax = obj && obj.p5Tax || 0;
        this.p6Ex = obj && obj.p6Ex || 0;
        this.p6Tax = obj && obj.p6Tax || 0;
        this.p7Ex = obj && obj.p7Ex || 0;
        this.p7Tax = obj && obj.p7Tax || 0;
        this.p8Ex = obj && obj.p8Ex || 0;
        this.p8Tax = obj && obj.p8Tax || 0;
        this.p9Ex = obj && obj.p9Ex || 0;
        this.p9Tax = obj && obj.p9Tax || 0;
        this.p10Ex = obj && obj.p10Ex || 0;
        this.p10Tax = obj && obj.p10Tax || 0;
        this.saleEx = obj && obj.saleEx || 0;
        this.saleTax = obj && obj.saleTax || 0;
        this.specialEx = obj && obj.specialEx || 0;
        this.specialTax = obj && obj.specialTax || 0;
        this.retailFunc = obj && obj.retailFunc || '';
        this.wholesaleFunc = obj && obj.wholesaleFunc || '';
        this.p1Func = obj && obj.p1Func || '';
        this.p2Func = obj && obj.p2Func || '';
        this.p3Func = obj && obj.p3Func || '';
        this.p4Func = obj && obj.p4Func || '';
        this.p5Func = obj && obj.p5Func || '';
        this.p6Func = obj && obj.p6Func || '';
        this.p7Func = obj && obj.p7Func || '';
        this.p8Func = obj && obj.p8Func || '';
        this.p9Func = obj && obj.p9Func || '';
        this.p10Func = obj && obj.p10Func || '';
        this.specialFunc = obj && obj.specialFunc || '';
        this.saleFunc = obj && obj.saleFunc || '';
        this.onSale = obj && obj.onSale || false;
        this.onSpecial = obj && obj.onSpecial || false;
        this.accountEx = obj && obj.accountEx || 0;
        this.accountTax = obj && obj.accountTax || 0;
        this.surfaceArea = obj && obj.surfaceArea || 0;
        this.lengthCoverage = obj && obj.lengthCoverage || 0;
        this.widthCoverage= obj && obj.widthCoverage || 0;
        this.defaultCoverageType = obj && obj.defaultCoverageType || StockCoverageType.surfaceArea;
        this.freightItemGuid = obj && obj.freightItemGuid || '';
        this.wideImage = obj && obj.wideImage || null;
        this.recipeGuid = obj && obj.recipeGuid || '';
        this.glTaxSalesGuid = obj && obj.glTaxSalesGuid || '';
        this.glTaxPurchasesGuid = obj && obj.glTaxPurchasesGuid || '';
        this.glCogsGuid = obj && obj.glCogsGuid || '';
        this.glStockGuid = obj && obj.glStockGuid || '';
        this.glAdjustGuid = obj && obj.glAdjustGuid || '';
        this.glSurchargeGuid = obj && obj.glSurchargeGuid || '';
        this.glDiscountGuid = obj && obj.glDiscountGuid || '';
        this.glSalesGuid = obj && obj.glSalesGuid || '';
        this.stockDisplayGroupGuid = obj && obj.stockDisplayGroupGuid || '';
        this.orderBy = obj && obj.orderBy || 0;
        this.width = obj && obj.width || 0.00;
        this.height = obj && obj.height || 0.00;
        this.length = obj && obj.length || 0.00;
        this.unavailableLabel = obj && obj.unavailableLabel || "Out Of Stock";

        this.images = obj && obj.images || [];

        // Lets get the parent stock item.
        if(obj && obj.parent) {
            this.parent = new Stock(obj.parent);
        } else {
            this.parent = null;
        }

        this.characteristics = [];
        if(obj && obj.characteristics) {
            for(let key in obj.characteristics) {
                this.characteristics.push(new StockCharacteristic(obj.characteristics[key]));
            }
        }

        if(obj && obj.unitType) {
            this.unitType = new UnitType(obj.unitType);
        } else if(!this.unitType) {
            this.unitType = new UnitType({ name: 'Item'} );
        }
    }

    // toJSON is automatically used by JSON.stringify
    toJSON(): IStock {
        // copy all fields from `this` to an empty object and return in
        let tmp = Object.assign({}, this, {
            // convert fields that need converting
            costEx: this._costEx
        });

        // @ts-ignore
        tmp._costEx = undefined;
        // @ts-ignore
        tmp.unitType = undefined;

        return tmp;
    }
}
