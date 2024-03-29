import { Router } from "express";
import { productsModel } from "../persistencia/dao/models/products.model.js";
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import autorizeMiddleware from '../middlewares/authorize.middleware.js'
import { errorDictionary } from "../error/error.enum.js";
import { usersModel } from "../persistencia/dao/models/users.model.js";
import { enviarCorreo } from "../persistencia/dao/functions/emailSender.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const sort = req.query.sort;
    const query = req.query.query;

    if (limit <= 0 || page <= 0) {
      return res.status(401).json({ error: errorDictionary['INVALID_DATA_FORMAT'] });
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

    if (req.query.category) {
      filterCriteria.category = req.query.category;
    }
    if (req.query.title) {
      filterCriteria.title = req.query.title;
    }

    const { docs, totalDocs, totalPages, hasPrevPage, hasNextPage } = await productsModel.paginate(filterCriteria, {
      page,
      limit,
      sort: sortCriteria,
      category: filterCriteria.category,
      title: filterCriteria.title,
    });

    const prevLink = hasPrevPage ? `/products?page=${page - 1}&limit=${limit}` : null;
    const nextLink = hasNextPage ? `/products?page=${page + 1}&limit=${limit}` : null;

    res.status(200).json({
      status: "success",
      payload: docs,
      totalDocs,
      totalPages,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    return res.status(401).json({ error: errorDictionary['PRODUCT_NOT_FOUND'] });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;

    const product = await productsModel.findById(productId);

    if (product) {
      res.json(product);
    } else {
      return res.status(401).json({ error: errorDictionary['PRODUCT_NOT_FOUND'] });
    }
  } catch (error) {
    return res.status(401).json({ error: errorDictionary['PRODUCT_NOT_FOUND'] });
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

    if (!(currentUser.role === "admin" || currentUser.role === "premium")) {
      console.log("Error: Solo usuarios admin o premium pueden crear productos");
      return res.status(403).json({
        error: "Solo usuarios admin o premium pueden crear productos",
      });
    }

    const requiredFields = ['title', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Faltan campos obligatorios: ${missingFields.join(', ')}`;
      return res.status(400).json({ error: errorMessage });
    }

    const { error, value } = productSchema.validate(req.body);
    if (error || !value) {
      res.status(400).json({ error: error?.details[0].message || 'Error de validación del producto' });
      return;
    }
    const owner = currentUser.role === "admin" ? null : currentUser._id;
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

    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    logger.error("Error al crear el producto:", error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});
router.put("/:pid", autorizeMiddleware, async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedProductData = req.body;

    const updatedProduct = await productsModel.findByIdAndUpdate(productId, updatedProductData, { new: true });

    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      return res.status(401).json({ error: errorDictionary['PRODUCT_NOT_FOUND'] });
    }
  } catch (error) {
    return res.status(401).json({ error: errorDictionary['ERROR_TO_UPDATE_PRODUCT'] });
  }
});

router.delete("/:pid", autorizeMiddleware, async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await productsModel.findById(productId);

    if (!product) {
      logger.error("producto no encontrado")
      return res.status(404).json({ error: errorDictionary['PRODUCT_NOT_FOUND'] });
    }

    console.log("duenho", product.owner)
    if (!product.owner) {
      const result = await productsModel.findByIdAndDelete(productId);
      logger.info("Producto eliminado:", productId);
      return res.json({ message: "Producto eliminado exitosamente" });
    }

    const owner = await usersModel.findById(product.owner);
    if (!owner) {
      logger.info("duehno mo encontrado", owner);
      return res.status(404).json({ error: errorDictionary['OWNER_NOT_FOUND'] });
    }

    if (owner.role === 'premium') {
      await enviarCorreo(owner.email, 'Producto Eliminado', `El producto "${product.title}" ha sido eliminado. Descripción: ${product.description}`);
    }
    const result = await productsModel.findByIdAndDelete(productId);
    logger.info("Producto eliminado:", productId);
    res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    logger.error('Error al eliminar el producto:', error);
    res.status(500).json({ error: errorDictionary['ERROR_DELETE_PRODUCT'] });
  }
});



export default router;