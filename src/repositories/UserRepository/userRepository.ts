import db from "../../config/config-db";
import LoginUser from "../../Dto/UserDto/loginUserDto";
import RegisterUser from "../../Dto/UserDto/registerUserDto";
import RegisterAdmin from "../../Dto/UserDto/registerAdminDto";
import bcrypt from "bcryptjs";
import UpdateUserDto from "../../Dto/UserDto/updateUserDto";
import ToggleUserStatusDto from '../../Dto/UserDto/toggleUserStatusDto';

class UserRepository {
  static async add(user: RegisterUser) {
    // Insertar en usuario_general
    const sql =
      "INSERT INTO usuario_general (nombre, email, contraseña, estado, fecha_creacion_perf) VALUES ($1, $2, $3, $4, (NOW() AT TIME ZONE 'America/Bogota')) RETURNING *";
    const values = [user.nombre, user.email, user.contraseña, "Pendiente"];
    const result = await db.query(sql, values);
    
    // Insertar en la tabla cliente
    const usuario = result.rows[0]; // Aquí tienes el objeto completo, con id_usuario
    const sqlCliente = "INSERT INTO cliente (id_cliente) VALUES ($1)";
    await db.query(sqlCliente, [usuario.id_usuario]);

    return usuario; // Retorna el objeto completo
  }

  static async addAdmin(user: RegisterAdmin) {
    // Verificar el código de administrador
    if (user.codigoAdmin !== process.env.KEY_ADMIN) {
      throw new Error("Código de administrador inválido");
    }

    // Primero insertamos en usuario_general
    const sql =
      "INSERT INTO usuario_general (nombre, email, contraseña, estado, fecha_creacion_perf) VALUES ($1, $2, $3, $4, (NOW() AT TIME ZONE 'America/Bogota')) RETURNING id_usuario";
    const values = [
      user.nombre,
      user.email,
      user.contraseña,
      "Activo"
    ];
    const result = await db.query(sql, values);

    // Luego insertamos en la tabla administrador_sistema
    const userId = result.rows[0].id_usuario;
    const sqlAdmin = "INSERT INTO administrador_sistema (id_administrador) VALUES ($1)";
    await db.query(sqlAdmin, [userId]);

    return userId;
  }

  // Método para login
  static async login(loginData: LoginUser) {
    const result = await db.query(
      
    SELECT 
      u.id_usuario,
      u.contraseña,
      CASE 
        WHEN a.id_administrador IS NOT NULL THEN 'ADMIN'
        WHEN p.id_propietario IS NOT NULL THEN 'PROPIETARIO'
        ELSE 'CLIENTE'
      END AS role
    FROM usuario_general u
    LEFT JOIN administrador_sistema a ON u.id_usuario = a.id_administrador
    LEFT JOIN propietario_establecimiento p ON u.id_usuario = p.id_propietario
    WHERE u.email = $1
    LIMIT 1;
    ,
      [loginData.email]
    );

    if (result.rows.length === 0) {
      return { logged: false, status: "Credenciales inválidas" };
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(
      loginData.contraseña,
      user.contraseña
    );

    if (!isPasswordValid) {
      return { logged: false, status: "Credenciales inválidas" };
    }

    return {
      logged: true,
      status: "Autenticación exitosa",
      id: user.id_usuario,
      role: user.role,
    };
  }
  // Método para obtener usuario por ID
  static async getById(id: number) {
    const sql =
      "SELECT id_usuario, nombre, email, descripcion,foto_perfil,plato_favorito, fecha_creacion_perf, estado FROM usuario_general WHERE id_usuario = $1";
    const values = [id];
    const result = await db.query(sql, values);

    if (result.rows.length > 0) {
      // Verificar el rol del usuario
      const adminCheck = await db.query(
        "SELECT * FROM administrador_sistema WHERE id_administrador = $1",
        [id]
      );
      const propietarioCheck = await db.query(
        "SELECT * FROM propietario_establecimiento WHERE id_propietario = $1",
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
    try {
      let updateFields: string[] = [];
      let values: any[] = [];
      let paramIndex = 1;

      // Construir dinámicamente los campos a actualizar
      if (updateData.nombre) {
        updateFields.push(`nombre = $${paramIndex}`);
        values.push(updateData.nombre);
        paramIndex++;
      }

      if (updateData.email) {
        updateFields.push(`email = $${paramIndex}`);
        values.push(updateData.email);
        paramIndex++;
      }

      if (updateData.contraseña) {
        updateFields.push(`contraseña = $${paramIndex}`);
        values.push(updateData.contraseña);
        paramIndex++;
      }

      if (updateData.descripcion !== undefined) {
        updateFields.push(`descripcion = $${paramIndex}`);
        values.push(updateData.descripcion);
        paramIndex++;
      }

      if (updateData.foto_perfil !== undefined) {
        updateFields.push(`foto_perfil = $${paramIndex}`);
        values.push(updateData.foto_perfil);
        paramIndex++;
      }

      if (updateData.plato_favorito !== undefined) {
        updateFields.push(`plato_favorito = $${paramIndex}`);
        values.push(updateData.plato_favorito);
        paramIndex++;
      }

      // Si no hay campos para actualizar, retornar false
      if (updateFields.length === 0) {
        return false;
      }

      // Agregar el ID al final de los valores
      values.push(updateData.id);

      const sql = `
        UPDATE usuario_general
        SET ${updateFields.join(', ')}
        WHERE id_usuario = $${paramIndex}
      `;

      const result = await db.query(sql, values);
      return (result?.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error en UserRepository.update:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    const sql = `
                DELETE FROM usuario_general
                WHERE id_usuario = $1
            `;

    const result = await db.query(sql, [id]);
    return (result?.rowCount ?? 0) > 0;
  }

  static async toggleUserStatus(toggleDto: ToggleUserStatusDto): Promise<boolean> {
    try {
      const sql = `
        UPDATE usuario_general
        SET estado = $1
        WHERE id_usuario = $2
      `;
      
      const result = await db.query(sql, [toggleDto.estado, toggleDto.id_usuario]);
      return (result?.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error en UserRepository.toggleUserStatus:', error);
      throw error;
    }
  }

  static async updateEstadoConfirmacion(id: number): Promise<boolean> {
    try {
      const sql = `UPDATE usuario_general SET estado = 'Activo' WHERE id_usuario = $1`;
      const result = await db.query(sql, [id]);
      return (result?.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error al actualizar estado de confirmación:', error);
      throw error;
    }
  }

  static async getByEmail(email: string) {
    try {
      const sql = "SELECT * FROM usuario_general WHERE email = $1";
      const result = await db.query(sql, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en UserRepository.getByEmail:', error);
      throw error;
    }
  }

  static async upsertPasswordResetCode(email: string, code: string, expiresAt: Date) {
    await db.query(
        `INSERT INTO password_reset_codes (email, code, expires_at, verified)
         VALUES ($1, $2, $3, false)
         ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3, verified = false`,
        [email, code, expiresAt]
    );
  }

  static async getPasswordResetCode(email: string, code: string) {
    const result = await db.query(
        `SELECT * FROM password_reset_codes WHERE email = $1 AND code = $2 AND expires_at > (NOW() AT TIME ZONE 'America/Bogota')`,
        [email.trim().toLowerCase(), String(code).trim()]
    );
    return result.rows[0];
  }

  static async verifyPasswordResetCode(email: string) {
    await db.query(
        `UPDATE password_reset_codes SET verified = true WHERE email = $1`,
        [email]
    );
  }

  static async isPasswordResetVerified(email: string) {
    const result = await db.query(
        `SELECT * FROM password_reset_codes WHERE email = $1 AND verified = true AND expires_at > (NOW() AT TIME ZONE 'America/Bogota')`,
        [email]
    );
    return result.rows[0];
  }

  static async deletePasswordResetCode(email: string) {
    await db.query(
        `DELETE FROM password_reset_codes WHERE email = $1`,
        [email]
    );
  }

  static async updatePasswordByEmail(email: string, hashedPassword: string) {
    await db.query(
        `UPDATE usuario_general SET contraseña = $1 WHERE email = $2`,
        [hashedPassword, email]
    );
  }
}

export default UserRepository;
