import { Router } from "express";
import { productManager } from '../functions/ProductManager.js';
const router = Router();


router.get("/", async (req, res) => {
  try {
    const products = productManager.getProducts();
    res.render('home', { products });
  } catch (error) {
    console.error("Error al obtener la lista de productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/realtimeproducts", (req, res) => {
  try {
    const products = productManager.getProducts();
    res.render('realTimeProducts', { products });
  } catch (error) {
    console.error("Error al obtener la lista de productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

export default router;
