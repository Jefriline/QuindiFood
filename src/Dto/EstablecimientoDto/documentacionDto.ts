export class DocumentacionDto {
    private _registro_mercantil: string;
    private _rut: string;
    private _certificado_salud: string;
    private _registro_invima?: string;

    constructor(
        registro_mercantil: string,
        rut: string,
        certificado_salud: string,
        registro_invima?: string
    ) {
        this._registro_mercantil = registro_mercantil;
        this._rut = rut;
        this._certificado_salud = certificado_salud;
        this._registro_invima = registro_invima;
    }

    get registro_mercantil(): string {
        return this._registro_mercantil;
    }

    get rut(): string {
        return this._rut;
    }

    get certificado_salud(): string {
        return this._certificado_salud;
    }

    get registro_invima(): string | undefined {
        return this._registro_invima;
    }

    set registro_mercantil(registro_mercantil: string) {
        this._registro_mercantil = registro_mercantil;
    }

    set rut(rut: string) {
        this._rut = rut;
    }

    set certificado_salud(certificado_salud: string) {
        this._certificado_salud = certificado_salud;
    }

    set registro_invima(registro_invima: string | undefined) {
        this._registro_invima = registro_invima;
    }
} 