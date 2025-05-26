class PatrocinadorDto {
    private _nombre?: string;
    private _logo?: string;

    constructor(nombre?: string, logo?: string) {
        this._nombre = nombre;
        this._logo = logo;
    }

    get nombre(): string | undefined {
        return this._nombre;
    }
    set nombre(value: string | undefined) {
        this._nombre = value;
    }

    get logo(): string | undefined {
        return this._logo;
    }
    set logo(value: string | undefined) {
        this._logo = value;
    }
}

export default PatrocinadorDto; 