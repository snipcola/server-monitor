export class Response {
    constructor () {
        this.res = null;
        this.data = null;
        this.errors = [];
    };

    setData = (data) => this.data = data;
    addData = (data) => {
        const type = typeof this?.data;
        const isArray = Array?.isArray(this?.data);

        return isArray
                ? this?.data?.push(data)
            : type === 'object'
                ? this?.setData({ ...this.data, ...data })
            : type === 'number'
                ? this?.setData(this?.data + data)
            : type === 'string'
                ? this?.setData(`${this.data}${data}`)
            : false;
    };
    sendData = (data, add) => (add ? this?.addData(data) : this.setData(data)) && this.send();

    addError = (error) => this.errors?.push(error) && this.errors;
    sendError = (error) => this.addError(error) && this.send();
    hasErrors = () => this.errors?.length > 0;

    setResponse = (res) => this.res = res;
    getResponse = () => ({ data: this.data, errors: this.errors });

    sendPlain = (response) => this.res?.send(response);

    send = () => {
        this.addData({ success: !this.hasErrors() });

        const response = this.getResponse();
        const isObject = typeof response === 'object';

        return response
            ? isObject
                ? this.res?.json(response)
                : this.res?.send(response)
            : false;
    };
};