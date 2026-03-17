import { format, parse } from 'date-fns'

/**
 * Used to format inputs.
 *
 * @name Formatter
 * @class Formatter
 */
export default class Formatter {
    private readonly currencyformatter = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 2 });
    private readonly percentformatter = new Intl.NumberFormat('en-AU', { style: 'percent', maximumFractionDigits: 2 });

    constructor() {
    }

    /**
     * Format a date time.
     *
     * @name formatDateTime
     * @param date
     * @param formatString
     */
    static formatDateTime(date: any, formatString:string = 'dd/MM/yyyy HH:mm') {
        if (typeof date === 'string') {
            return format(Formatter.parse(date), formatString);
        }

        if(!date || !(Object.prototype.toString.call(date) === '[object Date]' && isFinite(date))) {
            console.log("Could not format the date object!");
            console.log(date);
            return '';
        }

        return format(date, formatString);
    }

    /**
     * Format to a date string.
     *
     * @name formatDate
     * @param date
     */
    static formatDate(date: any) {
        if (typeof date === 'string') {
            return format(Formatter.parse(date), 'dd/MM/yyyy');
        }

        if(!date || !(Object.prototype.toString.call(date) === '[object Date]' && isFinite(date))) {
            console.log("Could not format the date object! " + isFinite(date));
            console.log(date);
            return date;
        }

        return format(date, 'dd/MM/yyyy');
    }

    /**
     * Format for storage to the php server.
     *
     * @name formatDateForStorage
     * @param date
     */
    static formatDateForStorage(date: any) {
        if(!date || !((Object.prototype.toString.call(date) === '[object Date]' && isFinite(date)))) {
            return null;
        }

        //return formatISO(date);
        return format(date, 'yyyy-MM-dd HH:mm:ss');
    }

    static parse(value: string): Date {
        if(!value) {
            return new Date();
        }

        let retValue = parse(value, 'yyyy-MM-dd HH:mm:ss', new Date());
        // console.log("Parse: " + value);
        // console.log("Date: " + retValue);
        return retValue;
    }

    /**
     * Format a number to currency.
     *
     * @name formatCurrency
     * @param value
     */
    formatCurrency(value: any) {
        return this.currencyformatter.format(value);
    }

    /**
     * Format given the type of format. Supported types are 'string, number, currency, date, datetime'. Or you can use
     * an object.
     *
     * @name format
     * @param data
     * @param type
     * @example string
     * @example { type: 'number', decimalPlaces: 4 }
     */
    format(data: any, type: any = "string") {
        var format = type;
        if(type instanceof Object) {
            format = type.type;

            if(type.type === "number") {
                if(!type.hasOwnProperty("style")) {
                    type.style = 'decimal';
                }

                if(!type.hasOwnProperty("decimalPlaces")) {
                    type.decimalPlaces = 2;
                }

                return new Intl.NumberFormat('en-AU', { minimumFractionDigits: type.decimalPlaces, maximumFractionDigits: type.decimalPlaces, style: type.style }).format(data);
            }

            if(type.type === 'enum') {
                let obj = type.options.find(function(item:any) { return String(item.value) === String(data) });
                if(typeof obj === "undefined") {
                    console.error("Failed to get format for: " + data);
                    console.error(data);
                    console.error(type.options);
                    return '';
                }

                return obj.label;
            }

            if(type.type === 'datetime') {
                if(type.hasOwnProperty('format')) {
                    return Formatter.formatDateTime(data, type.format);
                }

                return Formatter.formatDateTime(data);
            }
        }

        switch (format) {
            case "string": return data;
            case "currency": return this.currencyformatter.format(data);
            case "date" : return Formatter.formatDate(data);
            case "datetime" : return Formatter.formatDateTime(data);
            case "number": return new Intl.NumberFormat('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data);
        }
    }

    static evenRound(num: number, decimalPlaces: number = 2) {
        var d = decimalPlaces || 0;
        var m = Math.pow(10, d);
        var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
        var i = Math.floor(n), f = n - i;
        var e = 1e-8; // Allow for rounding errors in f
        var r = (f > 0.5 - e && f < 0.5 + e) ?
                    ((i % 2 == 0) ? i : i + 1) : Math.round(n);
        return d ? r / m : r;
    }
}
