import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';
import { cartsModel } from '../persistencia/dao/models/carts.model.js';
import { productsModel } from '../persistencia/dao/models/products.model.js';
import autorizeMiddleware from '../middlewares/authorize.middleware.js'
const router = Router();

router.post("/", async (req, res) => {
  try {
    const newCart = new cartsModel();
    newCart.id = generateCartId();
    newCart.products = [];
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsModel.findOne({ _id: cid })
    .populate({
      path: 'products.product',
      model: 'Product',
    })
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

function generateCartId() {
  return uuidv4();
}

router.post("/:cid/product/:pid", autorizeMiddleware, async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity || 1;
    const product = await productsModel.findById(pid);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const cart = await cartsModel.findOne({ id: cid });
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    const productInCart = cart.products.find((item) => item.product.equals(product._id));

    if (productInCart) {
      productInCart.quantity += quantity;
    } else {
      cart.products.push({
        product: product._id,
        quantity: quantity,
      });
    }

    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar o actualizar el producto en el carrito" });
  }
});

router.get("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const cart = await cartsModel.findOne({ _id: cid });
    if (!cart) {
      res.status(404).json({ error: "Carrito no encontrado" });
      return;
    }
    const productInCart = cart.products.find((item) => item.product.toString() === pid);
    if (productInCart) {
      res.json(productInCart);
    } else {
      res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto del carrito" });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    console.log("Carrito ID:", cid);
    console.log("Producto ID:", pid);
    const cart = await cartsModel.findOne({ _id: cid });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    const productIndex = cart.products.findIndex(item => item.product.equals(pid));
    console.log("Índice del producto a eliminar:", productIndex);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    cart.products.splice(productIndex, 1);
    console.log("Producto eliminado del carrito");
    await cart.save();
    res.json(cart);
    console.log("Cambios guardados en el carrito");
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto del carrito" });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const updatedProducts = req.body.products;

    if (!Array.isArray(updatedProducts)) {
      return res.status(400).json({ error: "El formato de productos no es válido" });
    }

    const cart = await cartsModel.findOne({ _id: cid });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = updatedProducts;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;

    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({ error: "Cantidad inválida" });
    }
    const cart = await cartsModel.findOne({ _id: cid });
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    const productInCart = cart.products.find(item => item.product.equals(pid));
    if (!productInCart) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }
    productInCart.quantity = quantity;

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la cantidad del producto en el carrito" });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsModel.findOneAndRemove({ _id: cid });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    console.log('Carrito eliminado:', cart);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar los productos del carrito" });
  }
});

router.post('/carts/:cid', autorizeMiddleware, async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.body.productId;

    const cart = await cartManager.addProductToCart(cartId, productId);

    res.redirect('/carts/' + cart.id);
    res.json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;