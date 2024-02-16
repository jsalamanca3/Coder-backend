// configDB.js
import mongoose from "mongoose";
import config from "./config.js";

const MONGODB_URI = config.mongo_uri;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Conectado a la base de Datos'))
  .catch(error => console.error('Error al conectar a la base de datos:', error));