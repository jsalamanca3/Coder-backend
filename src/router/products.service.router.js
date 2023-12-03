import { Router } from "express";
import { productsManager } from "../persistencia/dao/managers/productsManager.js";
const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await productsManager.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await productsManager.getProductById(id);
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { title, price, stock } = req.body
  if (!title || !price) {
    return res.status(400).json({ message: 'Los campos de Nombre y Precio son requeridos' });
  }
  if (!stock) {
    delete req.body.stock;
  }
  const productData = req.body;
  try {
    const newProduct = await productsManager.addProduct(productData);
    res.json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedProductData = req.body;
  try {
    const updatedProduct = await productsManager.updateProduct(id, updatedProductData);
    res.json(updatedProduct);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await productsManager.deleteProduct(id);
    res.json(deletedProduct);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;