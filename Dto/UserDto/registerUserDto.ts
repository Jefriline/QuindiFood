class RegisterUser {
    private _name: string;
    private _email: string;
    private _password: string;

    constructor(name: string, email: string, password: string) {
        this._name = name;
        this._email = email;
        this._password = password;
    }

    // Getters
    get name(): string {
        return this._name;
    }

    get email(): string {
        return this._email;
    }

    get password(): string {
        return this._password;
    }

    // Setters
    set name(name: string) {
        this._name = name;
    }

    set email(email: string) {
        this._email = email;
    }

    set password(password: string) {
        this._password = password;
    }
}


export default RegisterUser;

//bro mire repositories, routes y services, toca mirar bien porque hay cosas muy raras, ta bien bro :( 