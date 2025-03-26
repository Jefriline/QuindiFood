export class DocumentacionDto {
    private _registro_mercantil: Buffer;
    private _rut: Buffer;
    private _certificado_salud: Buffer;
    private _registro_invima?: Buffer;

    constructor(
        registro_mercantil: Buffer,
        rut: Buffer,
        certificado_salud: Buffer,
        registro_invima?: Buffer
    ) {
        this._registro_mercantil = registro_mercantil;
        this._rut = rut;
        this._certificado_salud = certificado_salud;
        this._registro_invima = registro_invima;
    }

    get registro_mercantil(): Buffer {
        return this._registro_mercantil;
    }

    get rut(): Buffer {
        return this._rut;
    }

    get certificado_salud(): Buffer {
        return this._certificado_salud;
    }

    get registro_invima(): Buffer | undefined {
        return this._registro_invima;
    }

    set registro_mercantil(registro_mercantil: Buffer) {
        this._registro_mercantil = registro_mercantil;
    }

    set rut(rut: Buffer) {
        this._rut = rut;
    }

    set certificado_salud(certificado_salud: Buffer) {
        this._certificado_salud = certificado_salud;
    }

    set registro_invima(registro_invima: Buffer | undefined) {
        this._registro_invima = registro_invima;
    }
} 