import { Router } from "express";
import { usersManager } from "../persistencia/dao/managers/userManager.js";
import bcrypt from "bcrypt";
import { compareData, hashData } from "../utils.js";
import { errorDictionary } from './ruta/del/diccionarioDeErrores';

const router = Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  const userDB = await usersManager.findByEmail(email);
  if (!userDB) {
    return res.status(401).json({ error: errorDictionary['CREDENTIALS_ERROR'] });
  }
  const comparePassword = await compareData(password, userDB[0].password);
  if (!comparePassword) {
    return res.status(401).json({ error: errorDictionary['ERROR_TO_SAVE_MESSAGE'] });
  }
  req.session["email"] = email;
  req.session["first_name"] = userDB.first_name;
  req.session["isAdmin"] =
    email === "adminCoder@coder.com" && password === "Cod3r123" ? true : false;
  res.redirect(`/home/${userDB[0]._id}`);
});

router.post("/signup", async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const userToCreate = { ...req.body, password: hashedPassword };

  try {
    const createdUser = await usersManager.createOne(userToCreate);
    res.status(200).json({ message: "El usuario ha sido creado", createdUser });
  } catch (error) {
    return res.status(401).json({ error: errorDictionary['ERROR_TO_CREATE_USER'] });
  }
});

export default router;