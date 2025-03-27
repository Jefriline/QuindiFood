import db from "../../config/config-db";
import LoginUser from "../../Dto/UserDto/loginUserDto";
import RegisterUser from "../../Dto/UserDto/registerUserDto";
import RegisterAdmin from "../../Dto/UserDto/registerAdminDto";
import bcrypt from "bcryptjs";
import UpdateUserDto from "../../Dto/UserDto/updateUserDto";

class UserRepository {
  static async add(user: RegisterUser) {
    // Primero insertamos en usuario_general
    const sql =
      "INSERT INTO usuario_general (nombre, email, contrasena, estado, fecha_creacion_perf) VALUES ($1, $2, $3, $4, (NOW() AT TIME ZONE 'America/Bogota')) RETURNING id_usuario";
    const values = [user.nombre, user.email, user.contraseña, "Activo"];
    const result = await db.query(sql, values);

    // Luego insertamos en la tabla cliente
    const userId = result.rows[0].id_usuario;
    const sqlCliente = "INSERT INTO cliente (id_cliente) VALUES ($1)";
    await db.query(sqlCliente, [userId]);

    return userId;
  }

  static async addAdmin(user: RegisterAdmin) {
    // Verificar el código de administrador
    if (user.codigoAdmin !== process.env.KEY_ADMIN) {
      throw new Error("Código de administrador inválido");
    }

    // Primero insertamos en usuario_general
    const sql =
      "INSERT INTO usuario_general (nombre, email, contrasena, estado, rol, fecha_creacion_perf) VALUES ($1, $2, $3, $4, $5, (NOW() AT TIME ZONE 'America/Bogota')) RETURNING id_usuario";
    const values = [
      user.nombre,
      user.email,
      user.contraseña,
      "Activo",
      "ADMIN",
    ];
    const result = await db.query(sql, values);

    // Luego insertamos en la tabla administrador
    const userId = result.rows[0].id_usuario;
    const sqlAdmin = "INSERT INTO administrador (id_administrador) VALUES ($1)";
    await db.query(sqlAdmin, [userId]);

    return userId;
  }

  // Método para login
  static async login(loginData: LoginUser) {
    const sql =
      "SELECT id_usuario, contrasena FROM usuario_general WHERE email = $1";
    const values = [loginData.email];
    const result = await db.query(sql, values);

    if (result.rows.length > 0) {
      const isPasswordValid = await bcrypt.compare(
        loginData.contraseña,
        result.rows[0].contrasena
      );
      if (isPasswordValid) {
        // Verificar el rol del usuario
        const adminCheck = await db.query(
          "SELECT * FROM administrador WHERE id_admin = $1",
          [result.rows[0].id_usuario]
        );
        const propietarioCheck = await db.query(
          "SELECT * FROM propietario WHERE id_propietario = $1",
          [result.rows[0].id_usuario]
        );

        let role = "CLIENTE";
        if (adminCheck.rows.length > 0) {
          role = "ADMIN";
        } else if (propietarioCheck.rows.length > 0) {
          role = "PROPIETARIO";
        }

        return {
          logged: true,
          status: "Autenticación exitosa",
          id: result.rows[0].id_usuario,
          role: role,
        };
      }
      return { logged: false, status: "Credenciales inválidas" };
    }
    return { logged: false, status: "Credenciales inválidas" };
  }

  // Método para obtener usuario por ID
  static async getById(id: number) {
    const sql =
      "SELECT id_usuario, nombre, email FROM usuario_general WHERE id_usuario = $1";
    const values = [id];
    const result = await db.query(sql, values);

    if (result.rows.length > 0) {
      // Verificar el rol del usuario
      const adminCheck = await db.query(
        "SELECT * FROM administrador WHERE id_admin = $1",
        [id]
      );
      const propietarioCheck = await db.query(
        "SELECT * FROM propietario WHERE id_propietario = $1",
        [id]
      );

      let role = "CLIENTE";
      if (adminCheck.rows.length > 0) {
        role = "ADMIN";
      } else if (propietarioCheck.rows.length > 0) {
        role = "PROPIETARIO";
      }

      return {
        ...result.rows[0],
        role: role,
      };
    }
    return null;
  }

  static async emailExists(email: string) {
    const sql = "SELECT * FROM usuario_general WHERE email = $1";
    const values = [email];
    const result = await db.query(sql, values);
    return result.rows.length > 0;
  }

  static async update(updateData: UpdateUserDto): Promise<boolean> {
    const sql = `
                UPDATE usuario_general 
                SET 
                    nombre = COALESCE($1, nombre),
                    email = COALESCE($2, email),
                    contrasena = COALESCE($3, contrasena),
                    descripcion = COALESCE($4, descripcion),
                    foto_perfil = COALESCE($5, foto_perfil)
                WHERE id_usuario = $6
                RETURNING id_usuario
            `;

    const result = await db.query(sql, [
      updateData.nombre,
      updateData.email,
      updateData.contraseña,
      updateData.descripcion,
      updateData.foto_perfil,
      updateData.id,
    ]);

    return result.rows.length > 0;
  }
}

export default UserRepository;
