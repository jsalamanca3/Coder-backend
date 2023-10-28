import { Router } from "express";
import { usersManager } from "../dao/managers/userManager.js";
import bcrypt from "bcrypt";
import { compareData, hashData } from "../utils.js";

const router = Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  const userDB = await usersManager.findByEmail(email);
  if (!userDB) {
    return res.json({ error: "Password o Email incorrecto" });
  }
  const comparePassword = await compareData(password, userDB.password);
  if(!comparePassword) {
    return res.json({error: "Password o Email incorrecto"})
  }
  req.session["email"] = email;
  req.session["first_name"] = userDB.first_name;
  re.session["isAdmin"] =
  email === "adminCoder@coder.com" && password === "Cod3r123" ? true : false;
  res.redirect("/home");
});

/* router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const user = await usersManager.findByEmail({ email: email });
    if (!user) {
      return res.status(401).send('Correo o contraseña incorrectos');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      req.session.user = email;
      req.session.userRole = user.role;
      res.send('Inicio de sesión exitoso');
    } else {
      res.status(401).send('Correo o contraseña incorrectos');
    }
}); */

router.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (!error) {
      res.send('logout ok!');
      res.redirect("/login");
    } else {
      res.send({ status: 'Logout ERROR', body: error });
    }
  });
});



router.post("/signup", async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const userToCreate = { ...req.body, password: hashedPassword };

  try {
    const createdUser = await usersManager.createOne(userToCreate);
    res.status(200).json({ message: "El usuario ha sido creado", createdUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;