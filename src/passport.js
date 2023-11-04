import passport from "passport";
import { Strategy as LocalStorategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { usersManager } from "./dao/managers/userManager.js";
import { hashData, compareData } from "./utils.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

/* Local */
passport.use(
  "signup",
  new LocalStorategy(
    {
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

passport.use(
  "login",
  new LocalStorategy(
    {
      usernameField: "email",
    },
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
passport.use(
  "github",
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/users/github",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubEmail = profile.emails[0].value;
        if (!githubEmail) {
          done(new Error("Correo electrónico de GitHub no disponible"));
          return;
        }

        const userDB = await usersManager.findByEmail(githubEmail);

        if (!userDB.from_github) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash("1234", saltRounds);
          const newUser = {
            first_name: profile._json.name?.split(" ", 2).join(" ") || profile.username,
            last_name: profile._json.name?.split(" ").slice(2, 4).join(" ") || "lastname",
            email: githubEmail,
            password: hashedPassword,
            from_github: true,
            role: "usuario",
          };
          const result = await usersManager.createOne(newUser);
          return done(null, result);
        } else {
          return done(null, userDB);
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser(function (userDB, done) {
  console.log("serialize " + userDB._id);
  done(null, userDB._id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const userDB = await usersManager.findById(id);
    done(null, userDB);
  } catch (error){
    done(error)
  }
});
