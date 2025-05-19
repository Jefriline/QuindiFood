import { EmailClient } from "@azure/communication-email";
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING!;
const client = new EmailClient(connectionString);

export async function sendEmailAzure(to: string, subject: string, html: string, plainText?: string) {
    const emailMessage = {
        senderAddress: process.env.AZURE_COMMUNICATION_SENDER!, 
        content: {
            subject,
            plainText: plainText || "",
            html,
        },
        recipients: {
            to: [{ address: to }],
        },
    };

    const poller = await client.beginSend(emailMessage);
    const result = await poller.pollUntilDone();
    return result;
}

export function getConfirmationEmailTemplate(nombre: string, link: string) {
    return `
    <html>
        <body>
            <h2>¡Hola, ${nombre}!</h2>
            <p>Gracias por registrarte en QuindiFood.</p>
            <p>Por favor, haz clic en el siguiente enlace para confirmar tu cuenta:</p>
            <a href="${link}" style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Confirmar mi cuenta</a>
            <p>Este enlace expirará en 24 horas.</p>
            <br>
            <small>Si no fuiste tú, ignora este correo.</small>
        </body>
    </html>
    `;
} 