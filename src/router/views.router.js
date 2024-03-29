import { Router } from "express";
import { ProductManager } from '../persistencia/dao/functions/ProductManager.js';
import { usersManager } from '../persistencia/dao/managers/userManager.js';
import { productsManager } from '../persistencia/dao/managers/productsManager.js';
import { socketServer } from '../app.js';
import { CartManager } from "../persistencia/dao/functions/cartManager.js";
import { cartsModel } from "../persistencia/dao/models/carts.model.js";
import checkUserRole from '../persistencia/dao/managers/loginManager.js';
import { errorDictionary } from "../error/error.enum.js";
import logger from "../winston.js";
import calculateLastConnectionTime from "../persistencia/dao/functions/lastConnection.js";
import authorizeMiddleware from "../middlewares/authorize.middleware.js";
const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

router.get("/", (req, res) => {
  res.render('login');
});

router.get("/login", (req, res) => {
  res.render('login');
});

router.get("/home", (req, res) => {
  res.render("home");
});

router.get("/register", (req, res) => {
  res.render('signup');
});

router.get("/api/login/forgotPassword", (req, res) => {
  res.render('forgotPassword');
})

router.get("/api/login/resetPassword", (req, res) => {
  res.render('resetPassword');
})

router.get("/error", (req, res) => {
  res.render("error");
})

router.get('/profile', async (req, res) => {
  try {
    res.send('Bienvenido, usuario');
  } catch (error) {
    console.error('Error en la vista del Usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.get('/admin', checkUserRole, authorizeMiddleware, async (req, res) => {
  try {
    const userRole = req.session;
    const products = await productManager.findAll();
    res.render('deleteProduct', { role: userRole, products });
  } catch (error) {
    console.error('Error en la vista de administrador:', error);
    res.status(500).send('Error interno del servidor');
  }
});


router.get("/api", async (req, res) => {
  try {
    const carts = await cartManager.cartRepository.createCart();
    const products = await productManager.findAll();
    const cardId = carts.id
    res.render('home', { products, cardId });
  } catch (error) {
    logger.error("Error al obtener la lista de productos:", error);
    res.status(500).send({error: errorDictionary['PRODUCT_NOT_FOUND']});
  }
});

router.get("/api/realTimeProducts", async (req, res) => {
  try {
    const products = await productManager.findAll();
    res.render('realTimeProducts', { products });
  } catch (error) {
    logger.error("Error al obtener la lista de productos:", error);
    res.status(500).send({error: errorDictionary['DATABASE_CONNECTION_ERROR']});
  }
});

router.post("/api/realTimeProducts/addProduct", async (req, res) => {
  try {
    const product = req.body;
    const newProduct = await productManager.productRepository.addProduct(product);
    socketServer.emit('addProduct', newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    logger.error("Error al agregar un producto:", error);
    res.status(500).send({error: errorDictionary['DATABASE_CONNECTION_ERROR']});
  }
});

router.post("/api/realTimeProducts/deleteProduct", async (req, res) => {
  try {
    const productId = req.body.id;
    await productManager.productRepository.deleteProduct(productId);
    socketServer.emit('productDeleted', productId);
    res.status(204).end();
  } catch (error) {
    logger.error("Error al eliminar un producto:", error);
    res.status(500).send({error: errorDictionary['DATABASE_CONNECTION_ERROR']});
  }
});

router.get("/api/createproduct", (req, res) => {
  res.render('createproduct');
});

router.get("/home/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;
    const userInfo = await usersManager.findById(idUser);
    if (!userInfo) {
      return res.status(404).send("Usuario no encontrado");
    }

    const { first_name, last_name } = userInfo;

    let products = await productsManager.findAll();

    const userCart = await cartsModel.findOne({ userId: idUser });
    let carts = userCart || (await cartManager.cartRepository.createCart(idUser));
    const cartId = carts.id;

    products = products.map((item) => ({ ...item, cartId }));

    res.render('home', { first_name, last_name, products, idUser });
  } catch (error) {
    console.error('Error en la ruta /home/:idUser:', error);
    res.status(500).send('Error interno del servidor');
  }
});


router.get('/api/products', async (req, res) => {
  try {
    /* const userId = req.user ? req.user.id : 'admin, premium, user';
    const cart = await cartManager.cartRepository.getCart(userId);
    if (!cart) {
      await cartManager.cartRepository.createCart(userId);
     } */
    const products = await productsManager.getAllProducts();
     res.render('home', {products});
   } catch (error) {
    logger.error("Error al cargar la vista de productos:", error);
     res.status(500).send({error: errorDictionary['DATABASE_CONNECTION_ERROR']});
   }
 });

router.get('/carts/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    logger.info('soy un mensaje:', cartId)
    const cart = await cartsModel.findOne({ id: cartId }).populate('products.product'); //método populate
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.render('carrito', { cart });
  } catch (error) {
    logger.error('Error al cargar la vista del carrito:', error);
    res.status(500).json({error: errorDictionary['DATABASE_CONNECTION_ERROR']});
  }
});

router.get("/users/uploader/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;
    const userInfo = await usersManager.findById({ idUser });

    if (!userInfo) {
      return res.status(404).send("Usuario no encontrado");
    }

    res.render('uploader', { idUser });
  } catch (error) {
    res.status(500).send('Error interno del servidor');
  }
});

router.get("/api/users/delete", async (req, res) => {
  try {
    const users = await usersManager.findInactiveUsers(2);
    const usersWithTime = users.map(user => ({
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_connection_time: calculateLastConnectionTime(user.last_connection)
    }));

    console.log("ids", usersWithTime)

    res.render('userDelete', { users: usersWithTime });
  } catch (error) {
    console.error('Error al obtener los usuarios inactivos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

export default router;