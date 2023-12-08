import { Router } from "express";
import passport from "passport";
import { authToken, generateToken } from "../utils.js";

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
    if(!user) return res.status(400).send({staus:"error", error:"Invalid credentials"});
    const access_token = generateToken(user);
    res.send({status:"success", access_token});
});

router.get('/current', authToken,(req, res) => {
    res.send({status:"seccess", payload:req.user});
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

export default router;