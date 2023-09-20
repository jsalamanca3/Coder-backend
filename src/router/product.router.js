import { Router } from "express";
import ProductManager from "../ProductManager.js";
const router = Router();

router.get("/api/products", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const products = await productManager.getProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

router.get("/api/products/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

router.post("/api/products", async (req, res) => {
  try {
    const newProduct = req.body;
    const newProductId = generateProductId();
    newProduct.id = newProductId;
    await productManager.addProduct(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto" });
  }
});

router.put("/api/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const updatedProduct = req.body;
    const success = await productManager.updateProduct(pid, updatedProduct);
    if (success) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

router.delete("/api/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const success = await productManager.deleteProduct(pid);
    if (success) {
      res.json({ message: "Producto eliminado exitosamente" });
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;