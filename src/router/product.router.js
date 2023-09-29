import { Router } from "express";
import productManager from "../functions/ProductManager.js";
import Joi from 'joi';
const router = Router();

router.get("/", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
        return res.status(400).json({ error: "El parámetro 'limit' debe ser un número positivo" });
      }
      const products = await productManager.getProducts(limit);
      res.status(200).json({ message: "Productos cargados", products });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los productos", message: error.message });
    }
  });

router.get("/:pid", async (req, res) => {
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

const productSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    code: Joi.string().required(),
    price: Joi.number().min(0).required(),
    status: Joi.string().valid('available', 'sold').required(),
    stock: Joi.number().integer().min(0).required(),
    category: Joi.string().required(),
    thumbnails: Joi.array().items(Joi.string()).required(),
  });

router.post("/", async (req, res) => {
    try {
      const { error, value } = productSchema.validate(req.body);

      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      const newProduct = {
        id: generateProductId(),
        ...value,
      };

      await productManager.addProduct(newProduct);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ error: "Error al agregar el producto" });
    }
  });


router.put("/:pid", async (req, res) => {
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

router.delete("/:pid", async (req, res) => {
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