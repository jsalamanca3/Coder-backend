import passport from "passport";
import { Strategy as LocalStorategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { usersManager } from "./persistencia/dao/managers/userManager.js";
import { hashData, compareData } from "./utils.js";
import bcrypt from "bcrypt";
import config from "./config/config.js";
import { CartManager } from "./persistencia/dao/functions/cartManager.js";

const GITHUB_CLIENT_ID = config.github_client_id;
const GITHUB_CLIENT_SECRET = config.github_client_secret;

const JWT_SECRET = config.jwt_secret;

const GOOGLE_CLIENT_ID = config.google_client_id;
const GOOGLE_CLIENT_SECRET = config.google_client_secret;

/* Local */
passport.use("signup", new LocalStorategy({
  usernameField: "email",
  passReqToCallback: true,
},
  async (req, email, password, done) => {
    try {
      const userDB = await usersManager.findByEmail(email);
      if (userDB) {
        return done(null, false);
      }
      const hashedPassword = await hashData(password);
      const createdUser = await usersManager.createOne({
        ...req.body,
        password: hashedPassword,
      });
      done(null, createdUser);
    } catch (error) {
      done(error);
    }
  }
)
);

passport.use("login", new LocalStorategy({ usernameField: "email" },
  async (email, password, done) => {
    try {
      const userDB = await usersManager.findByEmail(email);
      if (!userDB) {
        return done(null, false);
      }
      const comparePassword = await compareData(password, userDB[0].password);
      if (!comparePassword) {
        return done(null, false);
      }
      done(null, userDB);
    } catch (error) {
      done(error);
    }
  }
)
);

/* GitHub */
passport.use("github", new GithubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/api/sessions/github",
  scope: ["user:email"],
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const gitHubEmail = profile.emails[0].value || profile._json.email;
      const userDB = await usersManager.findByEmail(gitHubEmail);
      //login
      if (userDB.length > 0) {
        if (userDB.from_github || userDB[0]?.from_github) {
          return done(null, userDB);
        } else {
          return done(null, false)
        }
      }
      //signup
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash("1234", saltRounds);

      const cartManagerInstance = new CartManager();

      const newUser = {
        first_name: profile._json.name?.split(" ", 2).join(" ") || profile.username,
        last_name: profile._json.name?.split(" ").slice(2, 4).join(" ") || "gt",
        email: gitHubEmail,
        password: hashedPassword,
        from_github: true,
        role: "user",
      };

      const createdUser = await usersManager.createOne(newUser);
      const userId = createdUser._id;
      const createCart = await cartManagerInstance.createCart(userId);
      createdUser.cart = createCart._id;
      await createdUser.save();

      return done(null, createdUser);
    } catch (error) {
      console.error('Error al procesar la autenticación de GitHub:', error);
      done(error);
    }
  }));


/* JWT */
passport.use("jwt", new JWTStrategy({
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
},
async (jwt_payload, done) => {
  console.log(jwt_payload);
  done(null, false);
}))


/* Google */
passport.use("google", new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/api/sessions/auth/google/callback",
  scope: ["user:email"],
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const goolgeEmail = profile.emails[0].value || profile._json.email;
      const userDB = await usersManager.findByEmail(goolgeEmail);
      //login
      if (userDB.length > 0) {
        if (userDB.from_google || userDB[0]?.from_google) {
          return done(null, userDB);
        } else {
          return done(null, false)
        }
      }
      //signup
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash("1234", saltRounds);

      const cartManagerInstance = new CartManager();

      const newUser = {
        first_name: profile._json.name?.split(" ", 2).join(" ") || profile.username,
        last_name: profile._json.name?.split(" ").slice(2, 4).join(" ") || "gt",
        email: goolgeEmail,
        password: hashedPassword,
        from_google: true,
        role: "user",
      };

      const createdUser = await usersManager.createOne(newUser);
      const userId = createdUser._id;
      const createCart = await cartManagerInstance.createCart(userId);
      createdUser.cart = createCart._id;
      await createdUser.save();

      return done(null, createdUser);
    } catch (error) {
      console.error('Error al procesar la autenticación de GitHub:', error);
      done(error);
    }
  }));


passport.serializeUser(function (userDB, done) {
  const userId = userDB._id || userDB[0]._id;
  console.log("serialize " + userId);
  done(null, userId);
});

passport.deserializeUser(async function (id, done) {
  try {
    const userDB = await usersManager.findById(id);
    done(null, userDB);
  } catch (error) {
    done(error)
  }
});