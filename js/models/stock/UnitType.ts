import IDataObject from "../general/IDataObject";
import uuid from "uuid-random";

interface IUnitType extends IDataObject {
    name: string;
    description: string;
    dimensionsMultiplier: number;
    palletName: string;
    wastage: number;
    hasWastage: boolean;
    wastageTitle: string;
    piecesName: string;
}

export default class UnitType implements IUnitType {
    guid: string = '';
    name: string = '';
    description: string = '';
    dimensionsMultiplier: number = 1;
    palletName: string = 'Pallet';
    wastage: number = 0;
    hasWastage: boolean = false;
    wastageTitle: string = 'Cutting & Wastage';
    piecesName: string = 'Pieces';

    constructor(obj? : IUnitType) {
        this.update(obj);
    }

    update(obj? : IUnitType) {
        this.guid = obj && obj.guid || uuid();
        this.name = obj && obj.name || '';
        this.description = obj && obj.description || '';
        this.dimensionsMultiplier = obj && obj.dimensionsMultiplier || 1;
        this.palletName = obj && obj.palletName || 'Pallet';
        this.wastage = obj && obj.wastage || 0;
        this.hasWastage = obj && obj.hasWastage || false;
        this.wastageTitle = obj && obj.wastageTitle || 'Cutting & Wastage';
        this.piecesName = obj && obj.piecesName || 'Pieces';
    }
}
