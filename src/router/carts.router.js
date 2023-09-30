import fs from 'fs/promises';
import CartManager from '../functions/cartManager.js';
import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const cartId = generateCartId(); // obtener el ID del carrito
const cartManager = new CartManager(cartId);

router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const data = await fs.readFile(`carrito_${cid}.json`, "utf8");
    const cart = JSON.parse(data);
    res.json(cart);
  } catch (error) {
    res.status(404).json({ error: "Carrito no encontrado" });
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
    const cart = await cartManager.addProductToCart(cid, pid, quantity);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});

router.get("/:cid/product/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await getProductByIdFromDatabase(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});


async function getProductByIdFromDatabase(pid) {
  try {
    const data = await fs.readFile('./productos.json', 'utf8');
    const products = JSON.parse(data);
    const product = products.find((p) => p.id === pid);
    return product;
  } catch (error) {
    throw error;
  }
}
export default router;