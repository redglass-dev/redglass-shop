import axios from 'axios';

/* Redglass Shared classes for website */
export class FormErrors {
    public errors = [];

    /**
     * Create a new Errors instance.
     */
    constructor() {
        this.errors = [];
    }


    /**
     * Determine if errors exist for the given field.
     *
     * @param {string} field
     */
    has(field:any) {
        return this.errors.hasOwnProperty(field);
    }


    /**
     * Determine if we have any errors.
     */
    any() {
        return Object.keys(this.errors).length > 0;
    }


    /**
     * Retrieve the error message for a field.
     *
     * @param {string} field
     */
    get(field:any) {
        if (this.errors[field]) {
            return this.errors[field][0];
        }
    }


    /**
     * Record the new errors.
     *
     * @param {object} errors
     */
    record(errors:any) {
        // this.errors = errors;
        // console.log(errors);
        // console.log(errors.hasOwnProperty('errors'));
        if(errors.hasOwnProperty('errors')) {
            // console.log(errors['errors']);
            this.errors = errors['errors'];
        }
    }

    add(field:any, message:any) {
        if(!this.errors.hasOwnProperty(field)) {
            // @ts-ignore
            this.errors[field] = [];
        }

        // @ts-ignore
        this.errors[field][0] = message;
    }

    /**
     * Clear one or all error fields.
     *
     * @param {string|null} field
     */
    clear(field:any) {
        if (field) {
            // console.log("Clear: " + field);
            delete this.errors[field];

            return;
        }

        this.errors = [];
    }

    clearAll() {
        this.errors = [];
    }
}

export default class Form {
    public originalData = [];
    public dataTypes = [];
    public errors: FormErrors;
    private _axios_local:any;

    get axiosLocal() {
        if (this._axios_local) {
            return this._axios_local;
        } else {
            return axios;
        }
    }

    set axiosLocal(value) {
        if(value) {
            this._axios_local = value;
        }
    }

    /**
     * Create a new Form instance.
     *
     * @param {object} data
     * @param axios
     */
    constructor(data:any, axios = null /*, dataTypes = [] */) {
        this.axiosLocal = axios;
        this.dataTypes = []; // dataTypes;

        if (typeof data !== 'undefined' && typeof data['toJSON'] === 'function') {
            this.originalData = data['toJSON']();
        } else {
            this.originalData = data;
        }

        for (let field in this.originalData) {
            // @ts-ignore
            this[field] = this.originalData[field];
            //this.originalData[field] = data[field];
        }

        this.errors = new FormErrors();
    }

    addField(name:any, value:any) {
        // @ts-ignore
        this[name] = value;
        // @ts-ignore
        this.originalData[name] = value;
    }

    removeField(name:any) {
        // @ts-ignore
        delete this[name];
        delete this.originalData[name];
    }

    /**
     * Fetch all relevant data for the form.
     */
    data() {
        let data = {};
        let od = this.originalData;

        // @ts-ignore
        if (typeof this.originalData['toJSON'] === 'function') {
            // @ts-ignore
            od = this.originalData['toJSON']();
        }

        for (let property in od) {
            // @ts-ignore
            data[property] = this[property];
        }

        return data;
    }

    update(data:any) {
        this.originalData = data;
        for (let field in data) {
            // @ts-ignore
            this[field] = data[field];
        }

        this.errors = new FormErrors();
    }

    /**
     * Reset the form fields.
     */
    reset() {
        for (let field in this.originalData) {
            if(this.dataTypes.hasOwnProperty(field)) {
                switch (this.dataTypes[field]) {
                    // @ts-ignore
                    case Number: this[field] = 0; break;
                    // @ts-ignore
                    case String: this[field] = ''; break;
                    // @ts-ignore
                    case Object: this[field] = {}; break;
                    // @ts-ignore
                    case Boolean: this[field] = false; break;
                }
            } else {
                if(Form.isNumber(this.originalData[field])) {
                    // @ts-ignore
                    this[field] = 0;
                } else if(this.isBoolean(this.originalData[field], field)) {
                    // @ts-ignore
                    this[field] = false;
                } else {
                    // @ts-ignore
                    this[field] = '';
                }
            }
        }

        this.errors.clearAll();
    }

    isString(o:any) {
        return typeof o == "string" || (typeof o == "object" && o["constructor"] === String);
    }

    static isNumber(n:any) {
        return !isNaN(parseFloat(n)) && !isNaN(n - 0);
    }

    isBoolean(o:any, field:any) {
        if(typeof o == "boolean") {
            return true;
        }

        if(typeof o == "object") {
            if(o !== null && o['constructor'] === Boolean) {
                return true;
            }
        }

        return false;
        //return typeof o == "boolean" || (typeof o == "object" && o["constructor"] === Boolean);
    }

    /**
     * Send a POST request to the given URL.
     * .
     * @param {string} url
     */
    post(url:any, axiosLocal = null) {
        return this.submit('post', url, axiosLocal);
    }

    /**
     * Send a PUT request to the given URL.
     * .
     * @param {string} url
     */
    put(url:any, axiosLocal = null) {
        return this.submit('put', url, axiosLocal);
    }

    /**
     * Send a PATCH request to the given URL.
     * .
     * @param {string} url
     */
    patch(url:any, axiosLocal = null) {
        return this.submit('patch', url, axiosLocal);
    }

    /**
     * Send a DELETE request to the given URL.
     * .
     * @param {string} url
     */
    delete(url:any, axiosLocal = null) {
        return this.submit('delete', url, axiosLocal);
    }

    /**
     * Submit the form.
     *
     * @param {string} requestType
     * @param {string} url
     */
    submit(requestType:any, url:any, axiosLocal = null) {
        this.axiosLocal = axiosLocal;
        return new Promise((resolve, reject) => {
            this.axiosLocal[requestType](url, this.data())
                .then((response:any) => {
                    this.onSuccess(response.data);

                    resolve(response.data);
                })
                .catch((error:any) => {
                    // console.log(error);
                    this.onFail(error.response.data);

                    reject(error.response.data);
                });
        });
    }

    /**
     * Handle a successful form submission.
     *
     * @param {object} data
     */
    onSuccess(data:any) {
        this.reset();
    }


    /**
     * Handle a failed form submission.
     *
     * @param {object} errors
     */
    onFail(errors:any) {
        this.errors.record(errors);
    }
}
