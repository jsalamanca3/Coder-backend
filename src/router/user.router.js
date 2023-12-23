import { Router } from "express";
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

router.post("/", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: errorDictionary['INVALID_DATA_FORMAT'] });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
    res.redirect(`/home/${createdUser._id}`);
  } catch (error) {
    logger.error("Error al registrar el usuario:", error);
    res.status(500).send({error: errorDictionary['ERROR_TO_CREATE_USER']});
  }
});

export default router;