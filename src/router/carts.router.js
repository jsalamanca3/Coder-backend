import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';
import { cartsModel } from '../dao/models/carts.model.js';
import { productsModel } from '../dao/models/products.model.js';

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
    const cart = await cartsModel.findOne({ id: cid });

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

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity || 1;
    const product = await productsModel.findOne({ id: pid });
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    const cart = await cartsModel.findOne({ id: cid });
    if (!cart) {
      res.status(404).json({ error: "Carrito no encontrado" });
      return;
    }

    cart.products.push({
      product: product,
      quantity: quantity,
    });

    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});

router.get("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const cart = await cartsModel.findOne({ id: cid });
    if (!cart) {
      res.status(404).json({ error: "Carrito no encontrado" });
      return;
    }

    const productInCart = cart.products.find((item) => item.product.id === pid);
    if (productInCart) {
      res.json(productInCart);
    } else {
      res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto del carrito" });
  }
});

export default router;
