class RatingDto {
    private _id_cliente: number;
    private _id_establecimiento: number;
    private _puntuacion: number;

    constructor(id_cliente: number, id_establecimiento: number, puntuacion: number) {
        this._id_cliente = id_cliente;
        this._id_establecimiento = id_establecimiento;
        this._puntuacion = puntuacion;
    }

    get id_cliente(): number {
        return this._id_cliente;
    }

    get id_establecimiento(): number {
        return this._id_establecimiento;
    }

    get puntuacion(): number {
        return this._puntuacion;
    }

    set id_cliente(id_cliente: number) {
        this._id_cliente = id_cliente;
    }

    set id_establecimiento(id_establecimiento: number) {
        this._id_establecimiento = id_establecimiento;
    }

    set puntuacion(puntuacion: number) {
        if (puntuacion < 1 || puntuacion > 5) {
            throw new Error('La puntuación debe estar entre 1 y 5');
        }
        this._puntuacion = puntuacion;
    }
}

export default RatingDto; 