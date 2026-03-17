import  uuid from "uuid-random";

export default class DataObject {
    guid: string = '';

    // Allow for any other properties
    [propName: string]: any;

    static isNumber(num:any) {
        return !isNaN(parseFloat(num)) && isFinite(num);
    }

    static NewGuid() {
        return uuid();
    }
}
