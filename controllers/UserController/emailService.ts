import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno desde .env

// Configurar el transporter de Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,  // Se obtiene desde el .env
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.response);
    return { success: true, message: "Correo enviado con éxito" };
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return { success: false, message: "Error al enviar el correo" };
  }
};
