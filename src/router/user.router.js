import { Router } from "express";
import { usersModel } from "../persistencia/dao/models/users.model.js";
import { usersManager } from "../persistencia/dao/managers/userManager.js";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";
import { CartManager } from "../persistencia/dao/functions/cartManager.js";
import { errorDictionary } from "../error/error.enum.js";
import logger from "../winston.js";
import multer from "multer";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await usersManager.findAll();
    res.status(200).json({ message: "Usuarios", users });
  } catch (error) {
    return res.status(500).json({ error: errorDictionary["USER_NOT_FOUND"] });
  }
});

router.get("/logout", async (req, res) => {
  try {
    const userSession = req.session;
    if (!userSession || (!userSession.user && !userSession.email)) {
      logger.info("Sesión completa:", userSession);
      return res.status(400).json({ error: "Usuario no identificado" });
    }

    const userEmail = userSession.user?.email || userSession.email;

    logger.info("Correo electrónico del usuario:", userEmail);
    logger.info("Sesión completa:", userSession);

    await usersModel.updateOne(
      { email: userEmail },
      { $set: { last_connection: new Date() } }
    );

    req.session.destroy((error) => {
      if (!error) {
        res.redirect("/login");
      } else {
        console.error("Error al destruir la sesión:", error);
        res
          .status(500)
          .json({ error: errorDictionary["INTERNAL_SERVER_ERROR"] });
      }
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({ error: errorDictionary["INTERNAL_SERVER_ERROR"] });
  }
});

router.get(
  "/:idUser",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { idUser } = req.params;
    try {
      const user = await usersManager.findById(idUser);
      res.status(200).json({ message: "Usuario", user });
    } catch (error) {
      res.status(500).json({ error: errorDictionary["USER_NOT_FOUND"] });
    }
  }
);

const saltRounds = 10;

router.post("/", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res
      .status(400)
      .json({ error: errorDictionary["INVALID_DATA_FORMAT"] });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await usersManager.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: errorDictionary["USER_ALREADY_EXISTS"] });
    }

    const cartManagerInstance = new CartManager();
    const createCart = await cartManagerInstance.createCart(userId);

    const createdUser = await usersManager.createOne({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: "user",
      cart: createCart._id,
    });
    console.log("Usuario creado con éxito:", createdUser);
    res.redirect(`/home/${createdUser._id}`);
  } catch (error) {
    console.log("Error code:", error.code);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: errorDictionary["USER_ALREADY_EXISTS"] });
    }
    logger.error("Error al registrar el usuario:", error);
    res.status(500).send({ error: errorDictionary["ERROR_TO_CREATE_USER"] });
  }
});

//multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder;

    if (file.fieldname === "profileImage") {
      folder = "profiles";
    } else if (file.fieldname === "productImage") {
      folder = "products";
    } else {
      folder = "documents";
    }

    cb(null, `uploads/${folder}`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

//ruta documents:

router.get(
  "/uploader/:idUser",
  async (req, res) => {
    console.log("entrando por aquí")
    try {
      const { idUser } = req.params;
      const user = await usersManager.findById(idUser);
      if (!user) {
        return res.status(404).render('error', { message: errorDictionary['USER_NOT_FOUND'] });
      }

      res.render("uploader", user);
    } catch (error) {
      console.error('Error en la carga del uploader:', error);
      res.status(500).json({ error: errorDictionary["USER_NOT_FOUND"] });
    }
  }
);

router.post("/:uid/documents", upload.array("documents"), async (req, res) => {
  const userId = req.params.uid;
  const uploadedDocuments = req.files;

  try {
    const user = await usersModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    user.documents = uploadedDocuments.map((document) => ({
      name: document.originalname,
      reference: document.path,
    }));

    await user.save();

    res.status(200).json({ message: "Documentos subidos exitosamente", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al subir documentos" });
  }
});

router.put("/premium/:uid", async (req, res) => {
  logger.info("Entrando al endpoint: premium.uid");
  const { uid } = req.params;

  try {
    const user = await usersModel.findById(uid);
    if (!user) {
      return res.status(404).json({ error: errorDictionary["USER_NOT_FOUND"] });
    }
    const requiredDocuments = [
      "Identificación",
      "Comprobante de domicilio",
      "Comprobante de estado de cuenta",
    ];
    const userDocuments = user.documents.map((document) => document.name);
    const hasRequiredDocuments = requiredDocuments.every((doc) =>
      userDocuments.includes(doc)
    );
    if (!hasRequiredDocuments) {
      return res.status(400).json({
        error: "Faltan documentos requeridos para actualizar a premium",
      });
    }
    if (!user.documentsProcessed) {
      return res.status(400).json({
        error: "El usuario no ha terminado de procesar su documentación",
      });
    }
    const newRole = user.role === "user" ? "premium" : "user";
    if (newRole !== "user" && newRole !== "premium") {
      return res.status(400).json({ error: "Rol no válido" });
    }
    user.role = newRole;
    await user.save();
    res
      .status(200)
      .json({ message: "Rol de usuario actualizado a premium con éxito" });
  } catch (error) {
    logger.error("Error al cambiar el rol:", error);
    res.status(500).json({ error: errorDictionary["INTERNAL_SERVER_ERROR"] });
  }
});

export default router;
