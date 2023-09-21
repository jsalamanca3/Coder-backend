import fs from 'fs/promises';
import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';
const router = Router();

router.post("/", async (req, res) => {
  try {
    const newCart = {
      id: generateCartId(),
      products: [],
    };
    await fs.writeFile(`carrito_${newCart.id}.json`, JSON.stringify(newCart, null, 2), "utf8");
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

router.post("/:cid/product/:pid", async (req, res) => {
    try {
      const cid = req.params.cid;
      const pid = req.params.pid;
      const quantity = req.body.quantity || 1;
      const product = await getProductByIdFromDatabase(pid);
      if (!product) {
        res.status(404).json({ error: "Producto no encontrado" });
        return;
      }
      const cartId = generateCartId();
      const cartFilePath = `carrito_${cid}.json`;
      let cart = { id: cartId, products: [] };
      try {
        const cartData = await fs.readFile(cartFilePath, "utf8");
        cart = JSON.parse(cartData);
      } catch (error) {}
      const existingProduct = cart.products.find((item) => item.product === pid);
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: pid, quantity });
      }
      await fs.writeFile(cartFilePath, JSON.stringify(cart, null, 2), "utf8");
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Error al agregar el producto al carrito" });
    }
  });

function generateCartId() {
  return uuidv4();
}

async function getProductByIdFromDatabase(pid) {
  try {
    const data = await fs.readFile('productos.json', 'utf8');
    const products = JSON.parse(data);
    const product = products.find((p) => p.id === pid);
    return product;
  } catch (error) {
    throw error;
  }
}
export default router;