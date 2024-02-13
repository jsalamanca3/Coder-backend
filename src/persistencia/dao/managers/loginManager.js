import express from 'express';
import { errorDictionary } from "../../../error/error.enum.js";
import { usersModel } from "../models/users.model.js";
import { usersManager } from "./userManager.js";

function checkUserRole(req, res, next) {
  try {
    console.log("Verificando sesión de usuario:", req.session);
    if (!req.session || !req.session.passport || !req.session.passport.user) {
      console.log("No hay una sesión de usuario válida.");
      return res.status(403).send({ error: errorDictionary['AUTHENTICATION_ERROR'] });
    }
    const userId = req.session.passport.user;
    console.log("Verificando sesión de usuario model:", userId);
    usersManager.findById(userId)
      .then(user => {
        if (!user || user.role !== 'admin') {
          console.log("El usuario no tiene permisos de administrador.");
          return res.status(403).send({ error: errorDictionary['AUTHORIZATION_ERROR'] });
        }
        console.log("El usuario tiene permisos de administrador.");
        req.user = user;
        next();
      })
      .catch(error => {
        console.error('Error al verificar el rol de usuario:', error);
        return res.status(500).send({ error: errorDictionary['INTERNAL_SERVER_ERROR'] });
      });
  } catch (error) {
    console.error('Error al verificar el rol de usuario:', error);
    return res.status(500).send({ error: errorDictionary['INTERNAL_SERVER_ERROR'] });
  }
}


export default checkUserRole;
