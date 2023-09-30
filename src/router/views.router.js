import { Router } from "express";
import { productManager } from '../functions/ProductManager.js';
import { socketServer } from '../app.js';

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
    socketServer.emit('addProduct', newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al agregar un producto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/realTimeProducts/deleteProduct", async (req, res) => {
  try {
    const productId = req.body.id;
    await productManager.deleteProduct(productId);
    socketServer.emit('productDeleted', productId);
    res.status(204).end();
  } catch (error) {
    console.error("Error al eliminar un producto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

export default router;