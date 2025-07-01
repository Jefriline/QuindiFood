export class EstadoEstablecimientoUsuarioDto {
    private tieneEstablecimiento: boolean;
    private idEstablecimiento?: number;
    private nombreEstablecimiento?: string;
    private estadoEstablecimiento?: string;
    private estadoMembresia?: string;
    private fechaCreacion?: Date;

    constructor(
        tieneEstablecimiento: boolean,
        idEstablecimiento?: number,
        nombreEstablecimiento?: string,
        estadoEstablecimiento?: string,
        estadoMembresia?: string,
        fechaCreacion?: Date
    ) {
        this.tieneEstablecimiento = tieneEstablecimiento;
        this.idEstablecimiento = idEstablecimiento;
        this.nombreEstablecimiento = nombreEstablecimiento;
        this.estadoEstablecimiento = estadoEstablecimiento;
        this.estadoMembresia = estadoMembresia;
        this.fechaCreacion = fechaCreacion;
    }

    toJSON() {
        return {
            tieneEstablecimiento: this.tieneEstablecimiento,
            idEstablecimiento: this.idEstablecimiento,
            nombreEstablecimiento: this.nombreEstablecimiento,
            estadoEstablecimiento: this.estadoEstablecimiento,
            estadoMembresia: this.estadoMembresia,
            fechaCreacion: this.fechaCreacion
        };
    }
} 