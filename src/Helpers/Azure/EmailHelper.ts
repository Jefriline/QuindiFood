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
      <body style="background:#fff !important; font-family: 'Segoe UI', Arial, sans-serif; color:#222 !important; margin:0; padding:0;">
        <div style="max-width:520px; margin:40px auto; background:#fff !important; border-radius:18px; box-shadow:0 4px 24px #0002; padding:40px 28px;">
          <div style="text-align:center;">
            <img src="https://imagenesquindifood.blob.core.windows.net/importante/logoWithoutBackground.png?sv=2025-05-05&se=2099-12-31T00%3A00%3A00Z&sr=b&sp=r&sig=OXirhCpWwBr5b%2FyFd7pDjvHFYixH7ihXAO1jngqvmmY%3D" alt="QuindiFood" style="width:170px; margin-bottom:24px;"/>
          </div>
          <h2 style="color:#F59E42; text-align:center; margin-bottom:10px;">¡Hola, ${nombre}!</h2>
          <p style="text-align:center; font-size:1.13em; color:#333 !important;">Gracias por registrarte en <b>QuindiFood</b>.<br>Para activar tu cuenta, haz clic en el siguiente botón:</p>
          <div style="text-align:center; margin:38px 0;">
            <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:auto;">
              <tr>
                <td>
                  <a href="${link}" 
                    style="
                      display:inline-block;
                      background: linear-gradient(90deg, #F59E42 0%, #FFD36E 100%) !important;
                      color:#fff !important;
                      text-decoration:none;
                      padding:18px 0;
                      width:220px;
                      border-radius:12px;
                      font-weight:bold;
                      font-size:1.18em;
                      box-shadow:0 4px 16px #F59E4266;
                      text-align:center;
                      letter-spacing:0.5px;
                      border:none;
                      outline:none;
                      border-collapse:collapse;
                    "
                  >Confirmar mi cuenta</a>
                </td>
              </tr>
            </table>
          </div>
          <p style="text-align:center; color:#333 !important; font-size:1em;">Este enlace expirará en 24 horas.<br>Si no fuiste tú, ignora este correo.</p>
          <hr style="border:none; border-top:1px solid #eee; margin:38px 0 18px 0;">
          <div style="text-align:center; color:#bbb; font-size:1em;">&copy; QuindiFood 2025</div>
        </div>
      </body>
    </html>
    `;
}

export function getVerificationCodeTemplate(nombre: string, code: string) {
    const codeArr = code.padStart(6, '0').slice(0, 6).split('');
    return `
    <html>
      <body style="background:#fff !important; font-family: 'Segoe UI', Arial, sans-serif; color:#222 !important; margin:0; padding:0;">
        <div style="max-width:520px; margin:40px auto; background:#fff !important; border-radius:18px; box-shadow:0 4px 24px #0002; padding:40px 28px;">
          <div style="text-align:center;">
            <img src="https://imagenesquindifood.blob.core.windows.net/importante/logoWithoutBackground.png?sv=2025-05-05&se=2099-12-31T00%3A00%3A00Z&sr=b&sp=r&sig=OXirhCpWwBr5b%2FyFd7pDjvHFYixH7ihXAO1jngqvmmY%3D" alt="QuindiFood" style="width:170px; margin-bottom:24px;"/>
          </div>
          <h2 style="color:#F59E42; text-align:center; margin-bottom:10px;">¡Hola, ${nombre}!</h2>
          <p style="text-align:center; font-size:1.13em; color:#333 !important;">Has solicitado restablecer tu contraseña en <b>QuindiFood</b>.<br>Tu código de verificación es:</p>
          
          <!-- Código de verificación centrado -->
          <div style="width:100%; text-align:center; margin:38px 0;">
            ${codeArr.map(num => `
              <span style="
                display:inline-block;
                width:52px;
                height:62px;
                background: linear-gradient(90deg, #F59E42 0%, #FFD36E 100%) !important;
                color:#222 !important;
                font-size:2.3em;
                border-radius:14px;
                font-weight:bold;
                box-shadow:0 4px 16px #F59E4266;
                font-family: 'Segoe UI', Arial, sans-serif;
                text-shadow:0 2px 8px #fff8;
                border: 2.5px solid #fff !important;
                outline: 2px solid #F59E42;
                margin:0 8px;
                line-height:62px;
                text-align:center;
                vertical-align:middle;
              ">${num}</span>
            `).join('')}
          </div>
          
          <p style="text-align:center; color:#333 !important; font-size:1em;">Este código expirará en 15 minutos.<br>Si no solicitaste este cambio, ignora este correo.</p>
          <hr style="border:none; border-top:1px solid #eee; margin:38px 0 18px 0;">
          <div style="text-align:center; color:#bbb; font-size:1em;">&copy; QuindiFood 2025</div>
        </div>
      </body>
    </html>
    `;
}

export function getAprobacionEstablecimientoTemplate(nombre: string, nombreEstablecimiento: string) {
    return `
    <html>
      <body style="background:#fff !important; font-family: 'Segoe UI', Arial, sans-serif; color:#222 !important; margin:0; padding:0;">
        <div style="max-width:520px; margin:40px auto; background:#fff !important; border-radius:18px; box-shadow:0 4px 24px #0002; padding:40px 28px;">
          <div style="text-align:center;">
            <img src="https://imagenesquindifood.blob.core.windows.net/importante/logoWithoutBackground.png?sv=2025-05-05&se=2099-12-31T00%3A00%3A00Z&sr=b&sp=r&sig=OXirhCpWwBr5b%2FyFd7pDjvHFYixH7ihXAO1jngqvmmY%3D" alt="QuindiFood" style="width:170px; margin-bottom:24px;"/>
          </div>
          <h2 style="color:#F59E42; text-align:center; margin-bottom:10px;">¡Hola, ${nombre}!</h2>
          <p style="text-align:center; font-size:1.13em; color:#333 !important;">Tu establecimiento <b>${nombreEstablecimiento}</b> ha sido <b style='color:green;'>aprobado</b> y ya está visible en <b>QuindiFood</b>.<br>¡Ahora puedes gestionarlo!</p>
          <p style="text-align:center; color:#333 !important; font-size:1em;">Si tienes dudas, contáctanos.<br>¡Bienvenido a la familia QuindiFood!</p>
          <hr style="border:none; border-top:1px solid #eee; margin:38px 0 18px 0;">
          <div style="text-align:center; color:#bbb; font-size:1em;">&copy; QuindiFood 2025</div>
        </div>
      </body>
    </html>
    `;
}

export function getRechazoEstablecimientoTemplate(nombre: string, nombreEstablecimiento: string, motivo: string) {
    return `
    <html>
      <body style="background:#fff !important; font-family: 'Segoe UI', Arial, sans-serif; color:#222 !important; margin:0; padding:0;">
        <div style="max-width:520px; margin:40px auto; background:#fff !important; border-radius:18px; box-shadow:0 4px 24px #0002; padding:40px 28px;">
          <div style="text-align:center;">
            <img src="https://imagenesquindifood.blob.core.windows.net/importante/logoWithoutBackground.png?sv=2025-05-05&se=2099-12-31T00%3A00%3A00Z&sr=b&sp=r&sig=OXirhCpWwBr5b%2FyFd7pDjvHFYixH7ihXAO1jngqvmmY%3D" alt="QuindiFood" style="width:170px; margin-bottom:24px;"/>
          </div>
          <h2 style="color:#F59E42; text-align:center; margin-bottom:10px;">¡Hola, ${nombre}!</h2>
          <p style="text-align:center; font-size:1.13em; color:#333 !important;">Lamentamos informarte que tu establecimiento <b>${nombreEstablecimiento}</b> ha sido <b style='color:red;'>rechazado</b> en <b>QuindiFood</b>.</p>
          <div style="background:#ffeaea; border-radius:10px; padding:18px; margin:28px 0; color:#b00; font-size:1.08em; text-align:center;">
            <b>Motivo:</b> ${motivo}
          </div>
          <p style="text-align:center; color:#333 !important; font-size:1em;">Puedes corregir los datos y volver a enviar la solicitud.<br>Si tienes dudas, contáctanos.</p>
          <hr style="border:none; border-top:1px solid #eee; margin:38px 0 18px 0;">
          <div style="text-align:center; color:#bbb; font-size:1em;">&copy; QuindiFood 2025</div>
        </div>
      </body>
    </html>
    `;
} 