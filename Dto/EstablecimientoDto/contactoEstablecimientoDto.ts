export class ContactoEstablecimientoDto { //kjfdjkfjkdk
    private _url: string;

    constructor(url: string) {
        this._url = url;
    }

    get url(): string {
        return this._url;
    }

    set url(url: string) {
        this._url = url;
    }
} 