class UpdateUserDto {
    constructor(
        public id: number,
        public nombre: string,
        public email: string,
        public contrasena: string,
        public descripcion: string
    ) {}
}

export default UpdateUserDto; 