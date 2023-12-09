import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';
import { cartsModel } from '../persistencia/dao/models/carts.model.js';
import { productsModel } from '../persistencia/dao/models/products.model.js';
import autorizeMiddleware from '../middlewares/authorize.middleware.js';
import { ticketModel } from "../persistencia/dao/models/ticket.model.js";
const router = Router();

router.post("/", async (req, res) => {
  try {
    const newCart = new cartsModel();
    newCart.id = generateCartId();
    newCart.products = [];
    newCart.user = req.user;
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsModel.findOne({ _id: cid })
    .populate({
      path: 'products.product',
      model: 'Product',
    })
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

router.post("/:cid/product/:pid", autorizeMiddleware, async (req, res) => {
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
    const productInCart = cart.products.find((item) => item.product.equals(product._id));

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
    res.status(500).json({ error: "Error al agregar o actualizar el producto en el carrito" });
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
    const productInCart = cart.products.find((item) => item.product.toString() === pid);
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

    console.log("Carrito ID:", cid);
    console.log("Producto ID:", pid);
    const cart = await cartsModel.findOne({ _id: cid });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    const productIndex = cart.products.findIndex(item => item.product.equals(pid));
    console.log("Índice del producto a eliminar:", productIndex);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    cart.products.splice(productIndex, 1);
    console.log("Producto eliminado del carrito");
    await cart.save();
    res.json(cart);
    console.log("Cambios guardados en el carrito");
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto del carrito" });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const updatedProducts = req.body.products;

    if (!Array.isArray(updatedProducts)) {
      return res.status(400).json({ error: "El formato de productos no es válido" });
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

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;

    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({ error: "Cantidad inválida" });
    }
    const cart = await cartsModel.findOne({ _id: cid });
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    const productInCart = cart.products.find(item => item.product.equals(pid));
    if (!productInCart) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }
    productInCart.quantity = quantity;

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la cantidad del producto en el carrito" });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsModel.findOneAndRemove({ _id: cid });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    console.log('Carrito eliminado:', cart);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar los productos del carrito" });
  }
});

router.post('/carts/:cid', autorizeMiddleware, async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.body.productId;

    const cart = await cartManager.addProductToCart(cartId, productId);

    res.redirect('/carts/' + cart.id);
    res.json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/* agregar ticket */
router.post('/:cid/purchase', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsModel.findOne({ _id: cid }).populate('products.product');

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productsToPurchase = cart.products;
    const totalAmount = calculateTotalAmount(productsToPurchase);

    if (isNaN(totalAmount)) {
      return res.status(400).json({ error: 'El monto total no es válido' });
    }

    const failedProducts = productsToPurchase.filter(cartProduct => {
      const product = cartProduct.product;

      if (!product || typeof product.stock !== 'number') {
        console.log('Invalid product:', product);
        return true;
      }

      const quantityToPurchase = cartProduct.quantity;
      if (product.stock < quantityToPurchase) {
        return true;
      }

      product.stock -= quantityToPurchase;
      return false;
    });

    await Promise.all(productsToPurchase.map(cartProduct => cartProduct.product.save()));

    const user = cart.user;

    if (!user || !user.email) {
      return res.status(400).json({ error: 'El usuario asociado al carrito no tiene un correo válido' });
    }

    const userEmail = user.email;

    console.log('Total Amount:', totalAmount);

    const ticket = new ticketModel({
      code: generateTicketCode(),
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: user.email || userEmail,
      products: productsToPurchase,
    });

    await ticket.save();

    cart.products = failedProducts;

    await cart.save();

    if (failedProducts.length > 0) {
      return res.json({ failedProducts });
    }

    res.json({ message: 'Compra realizada exitosamente', ticket });
  } catch (error) {
    console.error('Error al procesar la compra:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/* router.post('/:cid/purchase', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsModel.findOne({ _id: cid }).populate('products.product');
    console.log('Cart:', cart);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productsToPurchase = cart.products;
    const failedProducts = [];

    const totalAmount = calculateTotalAmount(productsToPurchase);
    if (isNaN(totalAmount)) {
      return res.status(400).json({ error: 'El monto total no es válido' });
    }

    for (const cartProduct of productsToPurchase) {
      const product = cartProduct.product;

      if (!product || typeof product.stock !== 'number') {
        console.log('Invalid product:', product);
        continue;
      }

      const quantityToPurchase = cartProduct.quantity;

      if (product.stock >= quantityToPurchase) {
        product.stock -= quantityToPurchase;
        await product.save();
      } else {
        failedProducts.push(product._id);
      }
    };

    const user = cart.user;

    if (!user || !user.email) {
      return res.status(400).json({ error: 'El usuario asociado al carrito no tiene un correo válido' });
    };

    const userEmail = user.email;

    console.log('Total Amount:', totalAmount);

    const ticket = new ticketModel({
      code: generateTicketCode(),
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: user.email || userEmail,
      products: productsToPurchase,
    });

    await ticket.save();

    cart.products = cart.products.filter(cartProduct => failedProducts.includes(cartProduct.product._id));

    await cart.save();

    if (failedProducts.length > 0) {
      return res.json({ failedProducts });
    }

    res.json({ message: 'Compra realizada exitosamente', ticket });
  } catch (error) {
    console.error('Error al procesar la compra:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}); */


function generateTicketCode() {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().substring(6);
  return `TICKET-${randomString}-${timestamp}`;
}

function calculateTotalAmount(products) {
  let totalAmount = 0;

  for (const product of products) {
    const { price, quantity } = product;

    if (typeof price !== 'number' || typeof quantity !== 'number') {
      console.error('Error: price o quantity no son números', product);
      continue;
    }

    console.log(`Price: ${price}, Quantity: ${quantity}, Subtotal: ${price * quantity}`);

    totalAmount += price * quantity;
  }

  if (isNaN(totalAmount)) {
    console.error('Error: El monto total no es un número válido');
    return 0;
  }

  return parseFloat(totalAmount);
}



export default router;