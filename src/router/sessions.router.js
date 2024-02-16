import { Router } from "express";
import passport from "passport";
import { authToken, generateToken } from "../utils.js";
import { errorDictionary } from "../error/error.enum.js";
import logger from "../winston.js";
import { usersModel } from "../persistencia/dao/models/users.model.js";

const router = Router();

//Github
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
  }),
  async (req, res) => {
    try {
      const { email } = req.body;
      await usersModel.updateOne(
        { email: email },
        { $set: { last_connection: new Date() } },
        logger.info("hora de conexión:", new Date()),
      );
      res.redirect("/home");
    } catch (error) {
      logger.error("Error al procesar la solicitud:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

router.get("/auth/github",
  passport.authenticate("github", {
    scope: ["user:email"]
  })
);

router.get("/github",
  passport.authenticate("github", {
    failureRedirect: '/error',
  }),
  async (req, res) => {
    try {
      const user = req.user[0] ? req.user[0] : req.user;
      await usersModel.updateOne(
        { _id: user._id },
        { $set: { last_connection: new Date() } }
      );
      req.session.user = user;

      logger.info("Usuario autenticado con GitHub:", user);
      logger.info("Sesión configurada:", req.session);

      const userId = user._id;
      res.redirect(`/home/${userId}`);
    } catch (error) {
      console.error("Error al manejar la autenticación de GitHub:", error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);


/* JWTToken */
const users = []
router.post('/register', (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    const exists = users.find(user => user.email===email);
    if(exists) return res.status(400).send({status:"error", error:"User already exists"});
    const user = {
        first_name,
        last_name,
        email,
        password
    }
    users.push(user);
    const access_token = generateToken(user);
    res.send({status:"success", access_token});
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersModel.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ error: errorDictionary['CREDENTIALS_ERROR'] });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({ error: errorDictionary['CREDENTIALS_ERROR'] });
    }

    await usersModel.updateOne(
      { email: email },
      { $set: { last_connection: new Date() } },
      console.log("soy la hora de la conexón:", new Date())
    );

    const access_token = generateToken(user);
    res.send({ status: "success", access_token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: errorDictionary['INTERNAL_SERVER_ERROR'] });
  }
});


/* GOOGLE */

router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/error',
  }),
  async (req, res) => {
    try {
      const user = req.user[0] ? req.user[0] : req.user;
      await usersModel.updateOne(
        { _id: user._id },
        { $set: { last_connection: new Date() } }
      );
      req.session.user = user;

      logger.info("Usuario autenticado con Google:", user);
      logger.info("Sesión configurada:", req.session);

      const userId = user._id;
      res.redirect(`/home/${userId}`);
    } catch (error) {
      console.error("Error al manejar la autenticación de Google:", error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);


//current

// Estrategia de JWT
router.get('/current-jwt',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const userDTO = {
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
        };
        res.status(200).json(userDTO);
      } else {
        return res.status(401).json({ error: errorDictionary['AUTHENTICATION_ERROR'] });
      }
    } catch (error) {
      logger.error('Error en la ruta /current-jwt:', error);
      return res.status(500).json({ error: errorDictionary['DATABASE_CONNECTION_ERROR'] });
    }
  }
);

// Estrategia de GitHub
router.get('/current-github',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const userDTO = {
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
        };
        res.status(200).json(userDTO);
      } else {
        return res.status(401).json({ error: errorDictionary['AUTHENTICATION_ERROR'] });
      }
    } catch (error) {
      logger.error('Error en la ruta /current-github:', error);
      return res.status(500).json({ error: errorDictionary['DATABASE_CONNECTION_ERROR'] });
    }
  }
);

// Estrategia de Google
router.get('/current-google',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const userDTO = {
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
        };
        res.status(200).json(userDTO);
      } else {
        return res.status(401).json({ error: errorDictionary['AUTHENTICATION_ERROR'] });
      }
    } catch (error) {
      logger.error('Error en la ruta /current-google:', error);
      return res.status(500).json({ error: errorDictionary['DATABASE_CONNECTION_ERROR'] });
    }
  }
);

export default router;