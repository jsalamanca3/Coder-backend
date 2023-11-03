import { Router } from "express";
import { ProductManager } from '../functions/ProductManager.js';
import { usersManager } from '../dao/managers/userManager.js';
import { productsManager } from '../dao/managers/productsManager.js';
import { socketServer } from '../app.js';
import { CartManager } from "../functions/cartManager.js";
import { cartsModel } from "../dao/models/carts.model.js";
import checkUserRole from '../dao/managers/loginManager.js';

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

router.get("/", (req, res) => {
  res.render('login');
});

router.get("/register", (req, res) => {
  res.render('signup');
});

router.get("/error", (req, res) => {
  res.render("error");
})

router.get("/profile", checkUserRole('usuario'), (req, res) => {
  res.send('Bienvenido, usuario');
});

router.get("/admin", checkUserRole('admin'), (req, res) => {
  res.send('Bienvenido, administrador');
});

router.get("/realTimeProducts", async (req, res) => {
  try {
    const products = await productManager.findAll();
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

router.get("/api/createproduct", (req, res) => {
  res.render('createProduct');
});

router.get("/home/:idUser", async (req, res) => {
  const { idUser } = req.params
  const userInfo = await usersManager.findById(idUser)
  const { first_name, last_name } = userInfo;
  let products = await productsManager.findAll();
  const userCart = await cartsModel.findOne({ userId: idUser });
  let carts = '';
  !userCart ? carts = await cartManager.createCart(idUser) : carts = userCart;
  const cardId = carts.id
  products.map((item) => {
    item.cartId = cardId
  })
  res.render('home', { first_name, last_name, products });
});

router.get('/api/products', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'guest';
    const cart = await cartManager.getCart(userId);

    if (!cart) {
      await cartManager.createCart(userId);
    }
    const products = await productManager.findAll();
    res.render('home', { products, cart });
  } catch (error) {
    console.error("Error al cargar la vista de productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/api", async (req, res) => {
  try {
    const carts = await cartManager.createCart();
    const products = await productManager.findAll();
    const cardId = carts.id
    res.render('home', { products, cardId });
  } catch (error) {
    console.error("Error al obtener la lista de productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    console.log('soy un mensaje:', cartId)
    const cart = await cartsModel.findOne({ id: cartId }).populate('products.product'); //método populate
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.render('carrito', { cart });
  } catch (error) {
    console.error('Error al cargar la vista del carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;