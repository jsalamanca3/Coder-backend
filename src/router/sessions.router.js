import { Router } from "express";
import passport from "passport";
import { authToken, generateToken } from "../utils.js";
import { errorDictionary } from "../error/error.enum.js";

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
  })
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
    if (req.user[0]) {
      req.session.user = req.user[0];
    } else {
      req.session.user = req.user;
    }
    const userId = req.session.user._id;
    res.redirect(`/home/${userId}`);
  }
);


/* JWTToken */
const users = []
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const exists = users.find(user => user.email===email);
    if(exists) return res.status(400).send({status:"error", error:"User already exists"});
    const user = {
        name,
        email,
        password
    }
    user.push(user);
    const access_token = generateToken(user);
    res.send({status:"success", access_token});
});


router.post('/login', (req, res) => {
    const {email,password} = req.body;
    const user = users.find(user => user.email===email&&user.password===password);
    if(!user) return res.status(401).json({ error: errorDictionary['CREDENTIALS_ERROR'] });
    const access_token = generateToken(user);
    res.send({status:"success", access_token});
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
    if (req.user[0]) {
      req.session.user = req.user[0];
    } else {
      req.session.user = req.user;
    }
    const userId = req.session.user._id;
    res.redirect(`/home/${userId}`);
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
      console.error('Error en la ruta /current-jwt:', error);
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
      console.error('Error en la ruta /current-github:', error);
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
      console.error('Error en la ruta /current-google:', error);
      return res.status(500).json({ error: errorDictionary['DATABASE_CONNECTION_ERROR'] });
    }
  }
);




export default router;