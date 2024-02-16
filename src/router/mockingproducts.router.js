import express  from 'express';
import { Router } from 'express';
import  { productsManager } from '../persistencia/dao/managers/productsManager.js';
import { errorDictionary } from '../error/error.enum.js';
import logger from '../winston.js';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const mockProducts = await productsManager.generateMockProducts();
    res.json({ success: true, message: 'Productos simulados generados con éxito', products: mockProducts });
  } catch (error) {
    logger.error('Error al generar productos simulados:', error);
    res.status(500).json({ success: false, error: errorDictionary['ERROR_SIMULATING_PRODUCTS']});
  }
});


export default router;