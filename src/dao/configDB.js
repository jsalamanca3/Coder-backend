// configDB.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Conectado a la base de Datos'))
  .catch(error => console.error('Error al conectar a la base de datos:', error));