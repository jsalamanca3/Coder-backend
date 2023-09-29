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

router.get("/realTimeProducts", (req, res) => {
  try {
    const products = productManager.getProducts();
    res.render('realTimeProducts', { products });
  } catch (error) {
    console.error("Error al obtener la lista de productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/realTimeProducts/addProduct", async (req, res) => {
  try {
    const product = req.body;
    const newProduct = await productManager.addProduct(product);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al agregar un producto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

export default router;
