export default interface IDataObject {
    guid: string;

    // Allow for any other properties
    [propName: string]: any;
}