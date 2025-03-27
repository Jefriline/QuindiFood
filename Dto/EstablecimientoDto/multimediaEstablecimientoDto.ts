export class MultimediaEstablecimientoDto {
    private _multimedia: string[];

    constructor(multimedia: string[]) {
        this._multimedia = multimedia;
    }

    get multimedia(): string[] {
        return this._multimedia;
    }

    set multimedia(multimedia: string[]) {
        this._multimedia = multimedia;
    }
} 