import { Router } from "express";
import { ProductManager } from '../functions/ProductManager.js';
import { usersManager } from '../dao/managers/userManager.js';
import { productsManager } from '../dao/managers/productsManager.js';
import { socketServer } from '../app.js';

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    console.log(products);
    res.render('home', { products });
    console.log("Soy un mensaje nuevo de: ", products);
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

router.get('/products', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', { products });
  } catch (error) {
    console.error("Error al cargar la vista de productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartsModel.findOne({ id: cartId });
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar la vista del carrito' });
  }
});

export default router;