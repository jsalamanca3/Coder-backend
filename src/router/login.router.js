import { Router } from "express";
import { usersManager } from "../persistencia/dao/managers/userManager.js";
import bcrypt from "bcrypt";
import { compareData, hashData } from "../utils.js";
import { errorDictionary } from "../error/error.enum.js";

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

  console.log("saltRounds:", saltRounds);
  console.log("Datos del usuario:", first_name, last_name, email, password);
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


export default router;