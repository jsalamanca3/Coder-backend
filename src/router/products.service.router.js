import { Router } from "express";
import { productsManager } from "../persistencia/dao/managers/productsManager.js";
import autorizeMiddleware from "../middlewares/authorize.middleware.js";
import { errorDictionary } from "../error/error.enum.js";
import { productsModel } from "../persistencia/dao/models/products.model.js";
import logger from "../winston.js";
import Joi from "joi";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const products = await productsManager.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await productsManager.getProductById(id);
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: error.message });
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
  thumbnails: Joi.string().required()
});

router.post("/", autorizeMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;

    logger.info('Rol del usuario:', currentUser.role);
    logger.info('Rol del usuario:', req.user);

    if (!(currentUser.role === "admin" || currentUser.role === "premium")) {
      logger.error("Error: Solo usuarios admin o premium pueden crear productos");
      return res.status(403).json({
        error: "Solo usuarios admin o premium pueden crear productos",
      });
    }
    logger.info("Datos del producto recibidos:", req.body);

    const requiredFields = ['title', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Faltan campos obligatorios: ${missingFields.join(', ')}`;
      logger.error(errorMessage);
      return res.status(400).json({ error: errorMessage });
    }

    const { error, value } = productSchema.validate(req.body);
    if (error || !value) {
      logger.error("Error de validación del producto:", error?.details[0].message);
      res.status(400).json({ error: error?.details[0].message || 'Error de validación del producto' });
      return;
    }

    const owner = currentUser.role === "admin" ? adminUserId : currentUser._id;

    const newProduct = new productsModel({
      title: value.title,
      description: value.description,
      code: value.code,
      price: value.price,
      status: value.status,
      stock: value.stock,
      category: value.category,
      thumbnails: value.thumbnails,
      owner: owner,
    });

    logger.info("Nuevo producto:", newProduct);

    await newProduct.save();

    logger.info("Producto creado con éxito");

    res.status(201).json(newProduct);
  } catch (error) {
    logger.error("Error al crear el producto:", error);
    res.status(500).json({ error: errorDictionary['PRODUCT_CREATION_ERROR'] });
  }
});

router.put("/:id", autorizeMiddleware, async (req, res) => {
  const { id } = req.params;
  const updatedProductData = req.body;
  try {
    const updatedProduct = await productsManager.updateProduct(
      id,
      updatedProductData
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.delete("/:id", autorizeMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await productsManager.deleteProduct(id);
    res.json(deletedProduct);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
