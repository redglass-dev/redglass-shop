export default class Email {
    type: string = '';
    email: string = '';

    constructor(emailString?: string) {
        this.update(emailString);
    }

    update(emailString? : string) {
        if(!emailString) {
            return;
        }

        let tmp = emailString.trim().substr(6).split(':', 2);
        if(tmp.length === 2) {
            this.type = tmp[0].substr(5);
            this.email = tmp[1];
        }
    }

    toString() {
        return 'EMAIL;TYPE=' + this.type + ':' + this.email;
    }
}