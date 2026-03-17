export default class PhoneNumber {
    type: string = '';
    phoneNumber: string = '';
    ext: string = '';

    constructor(phoneNumberString? : string) {
        this.update(phoneNumberString);
    }

    update(phoneNumberString? : string) {
        if(!phoneNumberString) {
            return;
        }

        let tmp = phoneNumberString.trim().substr(27).split(':');
        this.type = tmp[0].substr(6, tmp[0].length - 7);

        if(typeof tmp[2] === 'undefined') {
            return;
        }

        let num = tmp[2].split(';');
        this.phoneNumber = num[0];

        if(num.length === 2) {
            let ex = num[1].split('=');
            if (ex.length === 2) {
                //this.ext = ex[1];
            }
        }
    }

    toString() {
        return 'TEL;VALUE=uri;PREF=1;TYPE="voice,' + this.type + '":tel:' + this.phoneNumber + ';ext='; // + this.ext;
    }
}