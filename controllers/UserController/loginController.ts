import { Request, Response } from "express";
import { sendEmail } from "./emailService";

const usersDB: { email: string; password: string }[] = [];

export const loginController = {
  login: (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = usersDB.find((u) => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    res.json({ message: "Inicio de sesión exitoso" });
  },

  recoverPassword: async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = usersDB.find((u) => u.email === email);
    
    if (!user) {
      return res.status(404).json({ message: "Correo no registrado" });
    }

    // Simulamos un enlace de recuperación
    const recoveryLink = `https://quindifood.com/recover-password?email=${email}`;

    const result = await sendEmail(
      email,
      "Recuperación de contraseña - QuindiFood",
      `Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente enlace para restablecerla: ${recoveryLink}`
    );

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(500).json({ message: result.message });
    }
  },

  sendConfirmationEmail: async (req: Request, res: Response) => {
    const { email } = req.body;
    
    const result = await sendEmail(
      email,
      "Confirmación de Registro - QuindiFood",
      "Gracias por registrarte en QuindiFood. Por favor, verifica tu correo electrónico."
    );

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(500).json({ message: result.message });
    }
  },
};
