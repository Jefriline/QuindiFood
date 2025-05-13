export class EstadoMembresiaDto {
    private _estado: string;

    constructor(estado: string) {
        this._estado = estado;
    }

    get estado(): string {
        return this._estado;
    }

    set estado(estado: string) {
        this._estado = estado;
    }
} 