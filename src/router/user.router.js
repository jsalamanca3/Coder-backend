import { Router } from "express";
import { usersModel } from "../persistencia/dao/models/users.model.js";
import { usersManager } from "../persistencia/dao/managers/userManager.js";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";
import { CartManager } from "../persistencia/dao/functions/cartManager.js";
import { errorDictionary } from "../error/error.enum.js";
import logger from "../winston.js";


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
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: errorDictionary['INVALID_DATA_FORMAT'] });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await usersManager.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: errorDictionary['USER_ALREADY_EXISTS'] });
    };

    const cartManagerInstance = new CartManager();
    const createCart = await cartManagerInstance.createCart(userId);

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

router.put('/premium/:uid', async (req, res) => {
  logger.info('Entrando al endpoint: premiun.uid');
  const { uid } = req.params;
  try {
    const user = await usersModel.findById(uid);

    if (!user) {
      return res.status(404).json({ error: errorDictionary['USER_NOT_FOUND'] });
    }

    const newRole = user.role === 'user' ? 'premium' : 'user';

    if (newRole !== 'user' && newRole !== 'premium') {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    user.role = newRole;
    await user.save();
    res.status(200).json({ message: 'Rol de usuario actualizado con éxito' });
  } catch (error) {
    logger.error('Error al cambiar el rol:', error);
    res.status(500).json({ error: errorDictionary['INTERNAL_SERVER_ERROR'] });
  }
});

export default router;