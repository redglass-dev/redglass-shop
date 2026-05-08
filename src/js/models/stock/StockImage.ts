import IDataObject from "../general/IDataObject";
import  uuid from "uuid-random";
import {IStock} from "./Stock";

export enum ImageType {
    Normal = 1,
    Wide = 2
}

interface IStockImage extends IDataObject{
    stockGuid: string;
    orderBy: number;
    uriLink: string;
    title: string;
    description: string;
    lastUpdate: string;
    imageType: ImageType;
}

export default class StockImage implements IStockImage{
    guid: string = '';
    stockGuid: string = '';
    uriLink: string = '';
    title: string = '';
    description: string = '';
    orderBy: number = 0;
    lastUpdate: string = '';
    imageType: ImageType = ImageType.Normal;

    constructor(obj? : Partial<StockImage>) {
        this.update(obj);
    }

    update(obj? : Partial<StockImage>) {
        this.guid = obj && obj.guid || uuid();
        this.stockGuid = obj && obj.stockGuid || '';
        this.uriLink = obj && obj.uriLink || '';
        this.title = obj && obj.title || '';
        this.description = obj && obj.description || '';
        this.orderBy = obj && obj.orderBy || 0;
        this.lastUpdate = obj && obj.lastUpdate || new Date().toUTCString();
        this.imageType = obj && obj.imageType || ImageType.Normal;
    }
}
