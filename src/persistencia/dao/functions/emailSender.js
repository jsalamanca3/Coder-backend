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

  async function enviarCorreo(email, subject, message) {
    console.log("Entrando aquí")
    try {
      const mailOptions = {
        from: MAIL_USER,
        to: email,
        subject: subject,
        text: message,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Correo electrónico enviado:', info.response);
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      throw error;
    }
  }

export { enviarCorreo };
