import IDataObject from "../general/IDataObject";
import uuid from "uuid-random";
import Email from "./Email";
import Address from "./Address";
import PhoneNumber from "./PhoneNumber";
import Formatter from "../general/Formatter";
import Account from "./Account";

export interface ICustomer extends IDataObject {
    email: string;
    firstName: string;
    lastName: string;
    emailsString: string;
    phoneNumbersString: string;
    addressesString: string;
    company: string;
    urls: string;
    notes: string;
    dateOfBirth: string;
    loyaltyPassGuid: string;
    localHidePrices: boolean;
    position: string;
    accountGuid: string;
    cardNumber: string;

    account: Account|null;
    isSupplier: boolean;
    points: number;

    remember_token: number;
    stripeId: number;
    card: string
    isAdmin: boolean;
    password: string;
    abn: string;
}


// Customer
export default class Customer implements ICustomer {
    guid: string = '';
    accountGuid: string = '';
    position: string = '';
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    company: string = '';
    urls: string = '';
    notes: string = '';
    loyaltyPassGuid: string = '';
    localHidePrices: boolean = false;
    emails: Email[] = [];
    addresses: Address[] = [];
    phoneNumbers: PhoneNumber[] = [];
    account: Account|null = null;
    isSupplier: boolean = false ;
    cardNumber: string = '';
    points: number = 0;
    remember_token: number = 0;
    stripeId: number = 0;
    card: string = '';
    isAdmin: boolean = false;
    password: string = '';
    abn: string = "";

    private _dateOfBirth: Date = new Date();

    get dateOfBirth() {
        return Formatter.formatDateForStorage(this._dateOfBirth) ?? '';
    }

    set dateOfBirth(value: string) {
        this._dateOfBirth = Formatter.parse(value); // = new Date(value);
    }

    set emailsString(str : string) {
        if(!str) {
            str = 'EMAIL;TYPE=Work:';
        }

        str = str.replace('\\n', '\n').replace('\\r', '\r');
        let list = str.split(/[\r\n]+/);
        for(var i = 0; i < list.length; i++) {
            let email = new Email(list[i]);
            // @ts-ignore
            this.emails[email.type] = email;
        }
    }

    get emailsString() : string {
        var str = '';
        var join = '';

        for(let key in this.emails) {
            str += join + this.emails[key].toString();
            join = '\n';
        }

        if(str === '') {
            return 'EMAIL;TYPE=Work:';
        }
        else {
            return str;
        }
    }

    set addressesString(str : string) {
        if(!str) {
            str = 'ADR;TYPE=Shipping:;;;;;;\r\nADR;TYPE=Billing:;;;;;;';
        }

        str = str.replace('\\n', '\n').replace('\\r', '\r');
        let list = str.split(/(\r\n)/);
        for(var i = 0; i < list.length; i++) {
            let adr = new Address(list[i]);
            if(adr.type !== '' && adr.type.indexOf('nADR') === -1) {
                // @ts-ignore
                this.addresses[adr.type] = adr;
            }
        }
    }

    get addressesString() : string {
        var str = '';
        var join = '';

        for(let key in this.addresses) {
            if(key.trim() !== "" && key.trim().indexOf('nADR') === -1) {
                // @ts-ignore
                str += join + this.addresses[key.trim()].toString();
                join = '\r\n';
            }
        }

        if(str === '') {
            return 'ADR;TYPE=Shipping:;;;;;;\r\nADR;TYPE=Billing:;;;;;;';
        }
        else {
            return str;
        }
    }

    set phoneNumbersString(str : string) {
        if(!str) {
            str = 'TEL;VALUE=uri;PREF=1;TYPE="voice,Work":tel:+61 ;ext=';
        }

        str = str.replace('\\n', '\n').replace('\\r', '\r');
        let list = str.split(/(\r\n)/);
        for(var i = 0; i < list.length; i++) {
            let phone = new PhoneNumber(list[i]);
            // @ts-ignore
            this.phoneNumbers[phone.type] = phone;
        }
    }

    get phoneNumbersString() : string {
        var str = '';
        var join = '';

        for(let key in this.phoneNumbers) {
            if(key.trim() != "") {
                // @ts-ignore
                str += join + this.phoneNumbers[key.trim()].toString();
                join = '\r\n';
            }
        }

        if(str === '') {
            return 'TEL;VALUE=uri;PREF=1;TYPE="voice,Work":tel:+61 ;ext=';
        }
        else {
            return str;
        }
    }

    get fullName() : string {
        return this.firstName + ' ' +  this.lastName;
    }

    get displayName() : string {
        if(this.company !== "") {
            return this.company;
        } else {
            return this.firstName + ' ' + this.lastName;
        }
    }

    constructor(obj? : ICustomer) {
        this.update(obj);
    }

    get phone() {
        return this.getPhone();
    }

    getPhone(type: string = 'Work') {
        if(!this.phoneNumbers.hasOwnProperty(type)) {
            // @ts-ignore
            this.phoneNumbers[type] = new PhoneNumber('TEL;VALUE=uri;PREF=1;TYPE="voice,' + type + '":tel:+61 ;ext=');
        }

        // @ts-ignore
        return this.phoneNumbers[type];
    }

    hasPhone(type: string): boolean {
        return this.phoneNumbers.hasOwnProperty(type);
    }

    getEmail(type: string = 'Work') {
        // @ts-ignore
        return this.emails[type];
    }

    getAddress(type: string = 'Shipping') {
        // Let's create it if we do not have one
        if(!this.addresses.hasOwnProperty(type)) {
            // @ts-ignore
            this.addresses[type] = new Address('ADR;TYPE=' + type + ':;;;;;;');
        }

        // @ts-ignore
        return this.addresses[type];
    }

    get hasAccount(): boolean {
        // @ts-ignore
        return this.accountGuid && this.accountGuid != '';
    }

    update(obj? : ICustomer) {
        this.emails = [];
        this.addresses = [];
        this.phoneNumbers = [];

        this.guid = obj && obj.guid || uuid();
        this.accountGuid = obj && obj.accountGuid || '';
        this.position = obj && obj.position || '';
        this.firstName = obj && obj.firstName || '';
        this.lastName = obj && obj.lastName || '';
        this.email = obj && obj.email || '';
        this.emailsString = obj && obj.emailsString || 'EMAIL;TYPE=Work:';
        this.phoneNumbersString = obj && obj.phoneNumbersString || 'TEL;VALUE=uri;PREF=1;TYPE="voice,Work":tel:+61 ;ext=';
        this.addressesString = obj && obj.addressesString || 'ADR;TYPE=Shipping:;;;;;;\r\nADR;TYPE=Billing:;;;;;;';
        this.company = obj && obj.company || '';
        this.urls = obj && obj.urls || '';
        this.notes = obj && obj.notes || '';
        this.loyaltyPassGuid = obj && obj.loyaltyPassGuid || '';
        this.dateOfBirth = obj && obj.dateOfBirth || new Date().toISOString();
        this.localHidePrices = obj && obj.localHidePrices || false;
        this.isSupplier = obj && obj.isSupplier || false;
        this.cardNumber = obj && obj.cardNumber || "";
        this.abn = obj && obj.abn || "";

        if(obj && obj.account) {
            this.account = new Account(obj.account);
        }
    }

    toJSON(): ICustomer {
        // copy all fields from `this` to an empty object and return in
        let tmp = Object.assign({}, this, {
            // convert fields that need converting
            phoneNumbersString: this.phoneNumbersString,
            addressesString: this.addressesString,
            emailsString: this.emailsString,
        });

        return tmp;
    }
}
