import { MultimediaEstablecimientoDto } from './multimediaEstablecimientoDto';
import { ContactoEstablecimientoDto } from './contactoEstablecimientoDto';
import { DocumentacionDto } from './documentacionDto';
import { EstadoMembresiaDto } from './estadoMembresiaDto';

export class EstablecimientoDto {
    private _nombre: string;
    private _ubicacion: string;
    private _telefono: string;
    private _descripcion: string;

    constructor(
        nombre: string,
        ubicacion: string,
        telefono: string,
        descripcion: string
    ) {
        this._nombre = nombre;
        this._ubicacion = ubicacion;
        this._telefono = telefono;
        this._descripcion = descripcion;
    }

    get nombre(): string {
        return this._nombre;
    }

    get ubicacion(): string {
        return this._ubicacion;
    }

    get telefono(): string {
        return this._telefono;
    }

    get descripcion(): string {
        return this._descripcion;
    }

    set nombre(nombre: string) {
        this._nombre = nombre;
    }

    set ubicacion(ubicacion: string) {
        this._ubicacion = ubicacion;
    }

    set telefono(telefono: string) {
        this._telefono = telefono;
    }

    set descripcion(descripcion: string) {
        this._descripcion = descripcion;
    }
}

export class IdEstablecimientoDto {
    private _id_establecimiento: number;

    constructor(id_establecimiento: number) {
        this._id_establecimiento = id_establecimiento;
    }

    get id_establecimiento(): number {
        return this._id_establecimiento;
    }

    set id_establecimiento(id_establecimiento: number) {
        this._id_establecimiento = id_establecimiento;
    }
} 