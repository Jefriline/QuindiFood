"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RegisterUser {
    constructor(name, email, password) {
        this._name = name;
        this._email = email;
        this._password = password;
    }
    // Getters
    get name() {
        return this._name;
    }
    get email() {
        return this._email;
    }
    get password() {
        return this._password;
    }
    // Setters
    set name(name) {
        this._name = name;
    }
    set email(email) {
        this._email = email;
    }
    set password(password) {
        this._password = password;
    }
}
exports.default = RegisterUser;
//bro mire repositories, routes y services, toca mirar bien porque hay cosas muy raras, ta bien bro :( 
