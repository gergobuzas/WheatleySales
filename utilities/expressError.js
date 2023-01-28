class expressError extends Error {
    constructor(message, statusCode) {
        super(); //Calls the constructor of the parent class
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = expressError;