import nodemailer from "nodemailer";
import config from "../../../config/config.js";

const MAIL_USER = config.mail_user;
const MAIL_PASSWORD = config.mail_password;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });

// Función para enviar el correo electrónico
async function enviarCorreo(email, asunto, mensaje) {

    const asunto = "El producto ha sido Eliminado";
    const mensaje = `El producto "${title}" ha sido eliminado. Descripción: ${description}`;
  try {
    // Configurar el correo electrónico
    const mailOptions = {
      from: MAIL_USER,
      to: email,
      subject: asunto,
      text: mensaje,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado:', info.response);
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    throw error;
  }
}

export { enviarCorreo };
