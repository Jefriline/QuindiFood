export class MultimediaEstablecimientoDto {
    private _multimedia: Buffer[];

    constructor(multimedia: Buffer[]) {
        this._multimedia = multimedia;
    }

    get multimedia(): Buffer[] {
        return this._multimedia;
    }

    set multimedia(multimedia: Buffer[]) {
        this._multimedia = multimedia;
    }
} 