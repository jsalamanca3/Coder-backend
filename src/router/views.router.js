import { Router } from "express";
import { productManager } from '../functions/ProductManager.js';
import { usersManager } from '../dao/managers/userManager.js';
import { productsManager } from '../dao/managers/productsManager.js'
import { messageModel } from "../dao/models/messages.models.js"
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

router.get("/signup", (req, res) => {
  res.render('signup');
});

router.get("/createproduct", (req, res) => {
  res.render('createProduct');
});

router.get("/home/:idUser", async (req, res) => {
  const {idUser} = req.params
  const userInfo = await usersManager.findById(idUser)
  const { first_name, last_name } = userInfo;
  const products = await productsManager.findAll();
  res.render('home', {first_name, last_name, products});
});

export default router;