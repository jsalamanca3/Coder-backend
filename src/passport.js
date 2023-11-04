import passport from "passport";
import { Strategy as LocalStorategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { usersManager } from "./dao/managers/userManager.js";
import { hashData, compareData } from "./utils.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

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
passport.use("github",
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/users/github",
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userDB = await usersManager.findByEmail(profile.emails[0].value);
        if (userDB) {
          if (userDB.form_github) {
            return done(null, userDB);
          } else {
            // signup
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('1234', saltRounds);
            console.log(profile)
            const createdUser = await usersManager.createOne({
              first_name: profile._json.name?.split(' ', 2).join(' ') || profile.username,
              last_name: profile._json.name?.split(' ').slice(2, 4).join(' ') || 'lastname',
              email: profile.emails[0].value,
              password: hashedPassword,
              from_github: true,
              role: 'usuario'
            });
            return done(null, createdUser);
          }
        }
      } catch (error) {
        done(error);
      }
    }
  )
);


passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await usersManager.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
