export default class Address {
    type: string = '';
    pobox: string = '';
    unit: string = '';
    street: string = '';
    city: string = '';
    state: string = '';
    postcode: string = '';
    country: string = '';

    constructor(str? : string) {
        this.update(str);
    }

    update(str? : string) {
        if(!str) {
            return;
        }

        let tmp = str.trim().substr(4).split(':', 2);
        if(tmp.length === 2) {
            this.type = tmp[0].substr(5);

            let addr = tmp[1].split(';');

            this.pobox = addr[0];
            this.unit = addr[1];
            this.street = addr[2];
            this.city = addr[3].toUpperCase();
            this.state = this.setState(addr[4]);
            this.postcode = addr[5];
            this.country = addr[6];
        }
    }

    toString() {
        return 'ADR;TYPE=' + this.type + ':' + this.pobox + ';' + this.unit + ';' + this.street + ';' + this.city + ';' + this.state + ';' + this.postcode + ';' + this.country;
    }

    setState(state:any) {
        if(state.toUpperCase() === "VICTORIA"){
            return "VIC";
        }

        if(state.toUpperCase() === "QUEENSLAND"){
            return "QLD";
        }

        if(state.toUpperCase() === "NEW SOUTH WALES"){
            return "NSW";
        }

        if(state.toUpperCase() === "TASMANIA"){
            return "TAS";
        }

        if(state.toUpperCase() === "SOUTH AUSTRALIA"){
            return "SA";
        }

        if(state.toUpperCase() === "NORTHERN TERRITORY"){
            return "NT";
        }

        if(state.toUpperCase() === "AUSTRALIAN CAPITAL TERRITORY"){
            return "ACT";
        }

        if(state.toUpperCase() === "WESTERN AUSTRALIA"){
            return "WA";
        }

        return state.toUpperCase();
    }
}
