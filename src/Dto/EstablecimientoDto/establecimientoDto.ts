import { MultimediaEstablecimientoDto } from './multimediaEstablecimientoDto';
import { ContactoEstablecimientoDto } from './contactoEstablecimientoDto';
import { DocumentacionDto } from './documentacionDto';
import { EstadoMembresiaDto } from './estadoMembresiaDto';

export class EstablecimientoDto {
    private _nombre: string;
    private _ubicacion: string;
    private _telefono: string;
    private _contacto: string;
    private _descripcion: string;
    private _FK_id_categoria_estab: number;
    private _FK_id_usuario: number;

    constructor(
        nombre: string,
        ubicacion: string,
        telefono: string,
        contacto: string,
        descripcion: string,
        FK_id_categoria_estab: number,
        FK_id_usuario: number
    ) {
        this._nombre = nombre;
        this._ubicacion = ubicacion;
        this._telefono = telefono;
        this._contacto = contacto;
        this._descripcion = descripcion;
        this._FK_id_categoria_estab = FK_id_categoria_estab;
        this._FK_id_usuario = FK_id_usuario;
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

    get contacto(): string {
        return this._contacto;
    }

    get descripcion(): string {
        return this._descripcion;
    }

    get FK_id_categoria_estab(): number {
        return this._FK_id_categoria_estab;
    }

    get FK_id_usuario(): number {
        return this._FK_id_usuario;
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

    set contacto(contacto: string) {
        this._contacto = contacto;
    }

    set descripcion(descripcion: string) {
        this._descripcion = descripcion;
    }

    set FK_id_categoria_estab(FK_id_categoria_estab: number) {
        this._FK_id_categoria_estab = FK_id_categoria_estab;
    }

    set FK_id_usuario(FK_id_usuario: number) {
        this._FK_id_usuario = FK_id_usuario;
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