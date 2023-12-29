import { Router } from "express";
import { usersManager } from "../persistencia/dao/managers/userManager.js";
import { usersModel } from "../persistencia/dao/models/users.model.js";
import bcrypt from "bcrypt";
import { compareData, hashData } from "../utils.js";
import { errorDictionary } from "../error/error.enum.js";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import config from "../config/config.js";
import logger from "../winston.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDB = await usersManager.findByEmail(email);
    if (!userDB) {
      return res.redirect("/signup");
    }

    const comparePassword = await compareData(password, userDB[0].password);

    if (comparePassword) {
      req.session["email"] = email;
      req.session["first_name"] = userDB[0].first_name;
      req.session["isAdmin"] = email === "adminCoder@coder.com" && password === "Cod3r123";
      return res.redirect(`/home/${userDB[0]._id}`);
    } else {
      return res.status(401).json({ error: errorDictionary['CREDENTIALS_ERROR'] });
    }

  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

const saltRounds = 10;

router.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;


  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "Por favor, proporciona nombre, apellido, correo y contraseña." });
  }
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  if (password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
  }

  const userToCreate = { first_name, last_name, email, password: hashedPassword };

  try {
    const createdUser = await usersManager.createOne(userToCreate);
    res.redirect(`/home/${createdUser._id}`);
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    return res.status(401).json({ error: errorDictionary['ERROR_TO_CREATE_USER'] });
  }
});

router.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;
  const user = await usersModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: errorDictionary['USER_NOT_FOUND'] });
  }

  if (user.resetToken && user.resetToken.used) {
    return res.status(400).json({ error: errorDictionary['TOKEN_ALREADY_USED'] });
  }

  const resetToken = jwt.sign({ userId: user._id }, config.jwt_secret, { expiresIn: '1h' });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.mail_user,
      pass: config.mail_password,
    },
  });
  const resetLink = `http://localhost:8080/api/login/resetPassword?token=${resetToken}`;
  const mailOptions = {
    from: config.mail_user,
    to: user.email,
    subject: 'Restablecer Contraseña',
    text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`,
  };
  console.log('soy el reset Token: ', resetToken);

  user.resetToken = {
    token: resetToken,
    used: false,
  };

  await user.save();

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: errorDictionary['EMAIL_SEND_ERROR'] });
    }
    res.status(200).json({ message: 'Correo enviado con éxito' });
  });
});

router.use((req, res, next) => {
  console.log('Solicitud:', req.method, req.url, req.body);
  next();
});

router.post("/resetPassword", async (req, res) => {
  console.log('Recibiendo solicitud para restablecer contraseña:', req.body);
  const { newPassword, resetToken } = req.body;

  jwt.verify(resetToken, config.jwt_secret, async (err, decoded) => {
    console.log('Error al verificar el token:', err);
    console.log('Token decodificado:', decoded);
    if (err) {
      logger.error('Error verificando el token:', err);
      return res.status(400).json({ error: errorDictionary['INVALID_TOKEN'] });
    }

    console.log('Token verificado con éxito:', decoded);

    try {
      const user = await usersModel.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: errorDictionary['USER_NOT_FOUND'] });
      }
      if (user.resetToken.used) {
        return res.status(400).json({ error: errorDictionary['TOKEN_ALREADY_USED'] });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken.used = true;
      await user.save();
      res.status(200).json({ success: true, message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      logger.error('Error al restablecer la contraseña:', error);
      res.status(500).json({ error: errorDictionary['INTERNAL_SERVER_ERROR'] });
    }
  });
});

export default router;