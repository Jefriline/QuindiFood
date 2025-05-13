class UpdateUserDto {
    constructor(
        public id: number,
        public nombre: string,
        public email: string,
        public contraseña: string,
        public descripcion: string
    ) {}
}

export default UpdateUserDto; 