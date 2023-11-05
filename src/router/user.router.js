import { Router } from "express";
import { usersManager } from "../dao/managers/userManager.js";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const users = await usersManager.findAll()
    res.status(200).json({ message: 'Usuarios', users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (!error) {
      res.redirect("/login");
    } else {
      res.send({ status: 'Logout ERROR', body: error });
    }
  });
});

router.post("/signup",
  passport.authenticate("signup", {
    successRedirect: "/home",
    failureRedirect: "/error",
  })
);
router.post("/login",
  passport.authenticate("login", {
    successRedirect: "/home",
    failureRedirect: "/error",
  })
);

/* Github */
router.get("/auth/github",
  passport.authenticate("github", {
    scope: ["userDB:email"]
  })
);

router.get("/github",
  passport.authenticate("github", {
    failureRedirect: '/error',
  }),
  async (req, res) => {
    if (req.user[0]) {
      req.session.user = req.user[0];
    } else {
      req.session.user = req.user;
    }
    console.log('por aqui paso');
    const userId = req.session.user._id
    res.redirect(`/home/${userId}`);
  }
);

router.get('/:idUser', async (req, res) => {
  const { idUser } = req.params
  try {
    const user = await usersManager.findById(idUser)
    res.status(200).json({ message: 'Usuario', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.post("/", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "Faltan campos por completar" });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const createdUser = await usersManager.createOne({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: 'usuario',
    });
    res.redirect(`/home/${createdUser._id}`);
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).send("Error al registrar el usuario");
  }
});

export default router;