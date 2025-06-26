export class ProductoDto {
    id_producto: number;
    nombre: string;
    precio: number;
    descripcion?: string;
    FK_id_establecimiento: number;
    FK_id_categoria_producto: number;
    categoria_producto?: string;
    multimedia?: any[];

    constructor(data: any) {
        this.id_producto = data.id_producto;
        this.nombre = data.nombre;
        this.precio = data.precio;
        this.descripcion = data.descripcion;
        this.FK_id_establecimiento = data.FK_id_establecimiento;
        this.FK_id_categoria_producto = data.FK_id_categoria_producto;
        this.categoria_producto = data.categoria_producto;
        this.multimedia = data.multimedia || [];
    }

    toJSON() {
        return {
            id_producto: this.id_producto,
            nombre: this.nombre,
            precio: this.precio,
            descripcion: this.descripcion,
            FK_id_establecimiento: this.FK_id_establecimiento,
            FK_id_categoria_producto: this.FK_id_categoria_producto,
            categoria_producto: this.categoria_producto,
            multimedia: this.multimedia
        };
    }
}

export class CrearProductoDto {
    nombre: string;
    precio: number;
    descripcion?: string;
    FK_id_categoria_producto: number;
    multimedia?: { tipo: 'foto' | 'video', ref: string }[];

    constructor(data: any) {
        this.nombre = data.nombre;
        this.precio = data.precio;
        this.descripcion = data.descripcion;
        this.FK_id_categoria_producto = data.FK_id_categoria_producto;
        this.multimedia = data.multimedia || [];
    }

    toJSON() {
        return {
            nombre: this.nombre,
            precio: this.precio,
            descripcion: this.descripcion,
            FK_id_categoria_producto: this.FK_id_categoria_producto,
            multimedia: this.multimedia
        };
    }
} 