import { Router } from "express";
import logger from "../winston.js";
const router = Router();


router.get('/', (req, res) => {
    logger.debug('Este es un mensaje de debug de prueba');
    logger.http('Este es un mensaje para http de prueba');
    logger.info('Este es un mensaje de info de prueba');
    logger.warning('Este es un mensaje de warning de prueba');
    logger.error('Este es un mensaje de error de prueba');
    logger.fatal('Este es un mensaje de fatal de prueba');
    res.send('Logs de prueba realizados');
  });

export default router;