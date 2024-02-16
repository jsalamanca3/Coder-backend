import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { cartsModel } from "../persistencia/dao/models/carts.model.js";
import { usersModel } from "../persistencia/dao/models/users.model.js";
import { productsModel } from "../persistencia/dao/models/products.model.js";
import autorizeMiddleware from "../middlewares/authorize.middleware.js";
import { ticketModel } from "../persistencia/dao/models/ticket.model.js";
import nodemailer from "nodemailer";
import config from "../config/config.js";
import { errorDictionary } from "../error/error.enum.js";
import logger from "../winston.js";
const router = Router();

const MAIL_USER = config.mail_user;
const MAIL_PASSWORD = config.mail_password;

router.get("/active", async (req, res) => {
  try {
    if (!req.user) {
      logger.info("Usuario no autenticado");
      return res.status(401).json({ error: errorDictionary["USER_NOT_FOUND"] });
    }

    const userId = req.user._id;
    logger.info("ID de usuario:", userId);

    const user = await usersModel.findOne({ _id: userId });
    if (user && user.cart) {
      const cart = await cartsModel.findById(user.cart);
      logger.info("Resultado de la búsqueda de carrito:", cart);

      if (cart) {
        res.json({ cart });
      } else {
        res.status(404).json({ error: errorDictionary["PRODUCT_NOT_FOUND"] });
      }
    } else {
      res.status(404).json({ error: errorDictionary["USER_NOT_FOUND"] });
    }
  } catch (error) {
    logger.error("Error al obtener el carrito activo:", error);
    res.status(500).json({ error: errorDictionary["UNEXPECTED_ERROR"] });
  }
});

router.post("/", async (req, res) => {
  try {
    const newCart = new cartsModel();
    newCart.id = generateCartId();
    newCart.products = [];
    newCart.user = req.user;
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: errorDictionary["CART_CREATION_ERROR"] });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsModel.findOne({ _id: cid }).populate({
      path: "products.product",
      model: "Product",
    });
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: errorDictionary["CART_NOT_FOUND"] });
    }
  } catch (error) {
    res.status(500).json({ error: errorDictionary["CART_OPERATION_ERROR"] });
  }
});

function generateCartId() {
  return uuidv4();
}

router.post("/:cid/product/:pid", autorizeMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    console.log('user:', req.user);
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity || 1;
    let product = await productsModel.findById(pid);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const cart = await cartsModel.findOne({ id: cid });
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const productInCart = cart.products.find((item) => item.product.equals(product._id));

    if (currentUser.role === "premium" && product.owner.equals(currentUser._id)) {
      if (productInCart) {
        productInCart.quantity += quantity;
      } else {
        return res
          .status(403)
          .json({ error: "No puedes agregar tu propio producto al carrito." });
      }
    } else {
      if (productInCart) {
        productInCart.quantity += quantity;
      } else {
        cart.products.push({
          product: product._id,
          quantity: quantity,
        });
      }
    }
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({
      error: "Error al agregar o actualizar el producto en el carrito",
    });
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
    const productInCart = cart.products.find(
      (item) => item.product.toString() === pid
    );
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

    logger.info("Carrito ID:", cid);
    logger.info("Producto ID:", pid);
    const cart = await cartsModel.findOne({ _id: cid });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    const productIndex = cart.products.findIndex((item) =>
      item.product.equals(pid)
    );
    logger.warning("Índice del producto a eliminar:", productIndex);

    if (productIndex === -1) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado en el carrito" });
    }

    cart.products.splice(productIndex, 1);
    logger.warning("Producto eliminado del carrito");
    await cart.save();
    res.json(cart);
    logger.info("Cambios guardados en el carrito");
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar el producto del carrito" });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const updatedProducts = req.body.products;

    if (!Array.isArray(updatedProducts)) {
      return res
        .status(400)
        .json({ error: "El formato de productos no es válido" });
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

/* router.post("/:cid/product/:pid", autorizeMiddleware, async (req, res) => {
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

    if (req.user.role === "premium" && product.owner === req.user._id) {
      return res.status(403).json({ error: errorDictionary["ACCESS_DANIED"] });
    }

    const productInCart = cart.products.find((item) =>
      item.product.equals(product._id)
    );
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
    res.status(500).json({
      error: "Error al agregar o actualizar el producto en el carrito",
    });
  }
}); */

router.delete("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsModel.findOneAndRemove({ _id: cid });

    if (!cart) {
      return res.status(404).json({ error: errorDictionary["CART_NOT_FOUND"] });
    }
    logger.info("Carrito eliminado:", cart);
    res.json(cart);
  } catch (error) {
    return res
      .status(404)
      .json({ error: errorDictionary["CART_DELETE_PRODUCT"] });
  }
});

router.post("/carts/:cid", autorizeMiddleware, async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.body.productId;

    const cart = await cartManager.addProductToCart(cartId, productId);

    res.redirect("/carts/" + cart.id);
    res.json({ message: "Producto agregado al carrito" });
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    return res.status(404).json({ error: errorDictionary["UNEXPECTED_ERROR"] });
  }
});

/* agregar ticket */
router.post("/:cid/purchase", async (req, res) => {
  try {
    const cartId = req.params.cid;

    const cart = await cartsModel
      .findOne({ _id: cartId })
      .populate("user")
      .populate("products.product");

    if (!cart) {
      return res.status(404).json({ error: errorDictionary["CART_NOT_FOUND"] });
    }

    logger.info("soy el carrito:", cart);

    const userId = cart.user;
    const user = await usersModel.findOne({ _id: userId });
    logger.info("soy el usuario:", userId);

    if (!user || !user.email) {
      logger.info("soy el email:", email);
      return res.status(404).json({ error: errorDictionary["CART_NOT_FOUND"] });
    }

    logger.info("soy el correo:", user);
    const userEmail = user.email;
    logger.info("soy el email del correo:", userEmail);

    const productsToPurchase = cart.products;
    const failedProducts = [];

    const totalAmount = calculateTotalAmount(productsToPurchase);

    if (isNaN(totalAmount)) {
      return res
        .status(404)
        .json({ error: errorDictionary["INVALID_PRODUCT_DATA"] });
    }

    for (const cartProduct of productsToPurchase) {
      const product = cartProduct.product;

      if (!product || typeof product.stock !== "number") {
        console.log("Invalid product:", product);
        continue;
      }

      const quantityToPurchase = cartProduct.quantity;

      if (product.stock >= quantityToPurchase) {
        product.stock -= quantityToPurchase;
        await product.save();
      } else {
        failedProducts.push(product._id);
      }
    }

    const ticket = new ticketModel({
      code: generateTicketCode(),
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: userEmail,
      products: productsToPurchase,
    });

    await ticket.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: MAIL_USER,
      to: userEmail,
      subject: "Detalle de compra",
      text: `¡Gracias por tu compra!\n\nDetalles de la compra:\n\n${JSON.stringify(
        ticket,
        null,
        2
      )}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error("Error al enviar el correo electrónico:", error);
        return res
          .status(404)
          .json({ error: errorDictionary["FAILE_TO_EMAIL"] });
      }
      logger.warning("Correo electrónico enviado:", info.response);

      res.status(200).json({ message: "Compra completada con éxito" });
    });
  } catch (error) {
    logger.error("Error al procesar la compra:", error);
    return res.status(404).json({ error: errorDictionary["UNEXPECTED_ERROR"] });
  }
});

function generateTicketCode() {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().substring(6);
  return `TICKET-${randomString}-${timestamp}`;
}

function calculateTotalAmount(products) {
  let totalAmount = 0;

  for (const product of products) {
    const { quantity } = product;
    const price = product.product.price;

    if (typeof price !== "number" || typeof quantity !== "number") {
      logger.error("Error: price o quantity no son números", product);
      continue;
    }

    logger.info(
      `Price: ${price}, Quantity: ${quantity}, Subtotal: ${price * quantity}`
    );

    totalAmount += price * quantity;
  }

  if (isNaN(totalAmount)) {
    logger.error("Error: El monto total no es un número válido");
    return 0;
  }

  return parseFloat(totalAmount);
}

export default router;
