import { Router } from "express";
import { productsModel } from "../dao/models/products.model.js";
import Joi from 'joi';
const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sort = req.query.sort;
    const query = req.query.query;

    if (limit <= 0) {
      return res.status(400).json({ status: "error", error: "El parámetro 'limit' debe ser un número positivo" });
    }

    let filterCriteria = {};

    if (query) {
      filterCriteria = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
        ]
      };
    }

    let sortCriteria = {};

    if (sort === 'price-asc') {
      sortCriteria.price = 1;
    } else if (sort === 'price-desc') {
      sortCriteria.price = -1;
    } else if (sort === 'name-asc') {
      sortCriteria.title = 1;
    } else if (sort === 'name-desc') {
      sortCriteria.title = -1;
    }

    const totalProducts = await productsModel.countDocuments(filterCriteria);
    const totalPages = Math.ceil(totalProducts / limit);

    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    const prevLink = hasPrevPage ? `/products?page=${page - 1}&limit=${limit}` : null;
    const nextLink = hasNextPage ? `/products?page=${page + 1}&limit=${limit}` : null;

    const productsToReturn = await productsModel
      .find(filterCriteria)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      status: "success",
      payload: productsToReturn,
      totalPages,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    if (error.message === "Producto no encontrado") {
      res.status(404).json({ error: "Producto no encontrado" });
    } else {
      res.status(500).json({ error: "Error al obtener los productos", message: error.message });
    }
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;

    const product = await productsModel.findById(productId);

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
  thumbnails: Joi.string().required()
});

router.post("/", async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    let imageValue = '';
    if (value.thumbnails.split('/')[0] === 'data:image') {
      imageValue = value.thumbnails;
    } else {
      imageValue = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${value.title}`
    }

    const newProduct = new productsModel({
      title: value.title,
      description: value.description,
      code: value.code,
      price: value.price,
      status: value.status,
      stock: value.stock,
      category: value.category,
      thumbnails: imageValue,
    });

    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto" });
  }
});


router.put("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedProductData = req.body;

    const updatedProduct = await productsModel.findByIdAndUpdate(productId, updatedProductData, { new: true });

    if (updatedProduct) {
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
    const productId = req.params.pid;
    const result = await productsModel.findByIdAndDelete(productId);

    if (result) {
      res.json({ message: "Producto eliminado exitosamente" });
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;