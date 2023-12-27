import { Router } from "express";
import { usersManager } from "../persistencia/dao/managers/userManager.js";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";
import { CartManager } from "../persistencia/dao/functions/cartManager.js";
import { errorDictionary } from "../error/error.enum.js";
import logger from "../winston.js";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import config from "../config/config.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const users = await usersManager.findAll()
    res.status(200).json({ message: 'Usuarios', users });
  } catch (error) {
    return res.status(500).json({ error: errorDictionary['USER_NOT_FOUND'] });
  }
})

router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (!error) {
      res.redirect("/login");
    } else {
      res.send({ error: errorDictionary['USER_NOT_FOUND'], body: error });
    }
  });
});

router.get('/:idUser',
  passport.authenticate('jwt', {session: false }),
  async (req, res) => {
  const { idUser } = req.params
  try {
    const user = await usersManager.findById(idUser)
    res.status(200).json({ message: 'Usuario', user });
  } catch (error) {
    res.status(500).json({ error: errorDictionary['USER_NOT_FOUND']});
  }
})

const saltRounds = 10;

router.post("/", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  console.log('Datos recibidos del formulario:', { first_name, last_name, email, password });

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: errorDictionary['INVALID_DATA_FORMAT'] });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('1:', password, saltRounds);
    console.log('2', hashedPassword);

    const existingUser = await usersManager.findByEmail(email);
    console.log('Usuario existente:', existingUser, 'soy el correo del usuario que se registra', email);
    if (existingUser) {
      return res.status(400).json({ error: errorDictionary['USER_ALREADY_EXISTS'] });
    };

    const cartManagerInstance = new CartManager();
    const createCart = await cartManagerInstance.createCart(userId);
    console.log('3:', createCart);
    console.log('4:', userId);

    const createdUser = await usersManager.createOne({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: 'user',
      cart: createCart._id,
    });
    console.log('Usuario creado con éxito:', createdUser);
    res.redirect(`/home/${createdUser._id}`);
  } catch (error) {
    console.log('Error code:', error.code);
    if (error.code === 11000) {
      return res.status(400).json({ error: errorDictionary['USER_ALREADY_EXISTS'] });
    }
    logger.error("Error al registrar el usuario:", error);
    res.status(500).send({error: errorDictionary['ERROR_TO_CREATE_USER']});
  }
});

router.post("/resetPassword", async (req, res) => {
  const { email, newPassword, resetToken } = req.body;
  jwt.verify(resetToken, 'secret_key', async (err, decoded) => {
    if (err) {
      logger.error('Error verificando el token:', err);
      return res.status(400).json({ error: errorDictionary['INVALID_TOKEN'] });
    }
    try {
      const user = await usersModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: errorDictionary['USER_NOT_FOUND'] });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      logger.error('Error al restablecer la contraseña:', error);
      res.status(500).json({ error: errorDictionary['INTERNAL_SERVER_ERROR'] });
    }
  });
});


router.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;
  const user = await usersModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: errorDictionary['USER_NOT_FOUND'] });
  }
  const resetToken = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.mail_user,
      pass: config.mail_password,
    },
  });
  const resetLink = `http://localhost:8080/api/users/resetPassword?token=${resetToken}`;
  const mailOptions = {
    from: config.mail_user,
    to: user.email,
    subject: 'Restablecer Contraseña',
    text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: errorDictionary['EMAIL_SEND_ERROR'] });
    }
    res.status(200).json({ message: 'Correo enviado con éxito' });
  });
});

router.put('/premium/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await usersModel.findById(uid);
    if (!user) {
      return res.status(404).json({ error: errorDictionary['USER_NOT_FOUND'] });
    }
    user.role = user.role === 'user' ? 'premium' : 'user';
    await user.save();
    res.status(200).json({ message: 'Rol de usuario actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: errorDictionary['INTERNAL_SERVER_ERROR'] });
  }
});

export default router;