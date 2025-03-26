export class EstadoMembresiaDto {
    private _estado: 'Activo' | 'Inactivo';

    constructor(estado: 'Activo' | 'Inactivo') {
        this._estado = estado;
    }

    get estado(): 'Activo' | 'Inactivo' {
        return this._estado;
    }

    set estado(estado: 'Activo' | 'Inactivo') {
        this._estado = estado;
    }
} 