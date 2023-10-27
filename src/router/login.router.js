import { Router } from "express";
import { usersManager } from "../dao/managers/userManager.js";
import bcrypt from "bcrypt";

const router = Router();


router.get('/', (req, res) => {
    const { first_name, password } = req.query;
    if (first_name !== 'pepe' || password !== 'pepepass') {
      return res.send('login failed');
    }
    req.session.user = first_name;
    req.session.admin = true;
    res.send('login success!');
});

router.post('/', async (req, res) => {
    const { first_name, password } = req.body;
    const user = await usersManager.findByFirstName({ first_name: first_name });
    if (!user) {
      return res.status(401).send('Nombre de usuario o contraseña incorrectos');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      req.session.user = first_name;
      req.session.userRole = user.role;
      res.send('Inicio de sesión exitoso');
    } else {
      res.status(401).send('Nombre de usuario o contraseña incorrectos');
    }
});


export default router;