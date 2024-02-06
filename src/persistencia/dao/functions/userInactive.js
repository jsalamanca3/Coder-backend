import nodemailer from "nodemailer";
import { usersManager } from "../managers/userManager.js";
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

async function sendInactiveUserEmail(email) {
  const subject = "Notificación de inactividad de cuenta";
  const message = "Tu cuenta ha sido eliminada debido a inactividad.";

  try {
    const user = await usersManager.findByEmail(email);

    if (!user) {
      console.error(`Usuario no encontrado para el correo electrónico ${email}`);
      return;
    }

    const mailOptions = {
      from: MAIL_USER,
      to: email,
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${email}: ${subject}`);
  } catch (error) {
    console.error(`Error al enviar el correo a ${email}:`, error);
    throw error;
  }
}

export { sendInactiveUserEmail };