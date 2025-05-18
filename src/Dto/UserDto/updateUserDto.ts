class UpdateUserDto {
    constructor(
        public id: number,
        public nombre?: string,
        public email?: string,
        public contraseña?: string,
        public descripcion?: string,
        public foto_perfil?: string,
        public plato_favorito?: string
    ) {}
}

export default UpdateUserDto; 