import { cartsModel } from "../dao/models/carts.model.js";
import { productsModel } from "../dao/models/products.model.js";
import { socketServer } from "../app.js";
import { v4 as uuidv4 } from "uuid";
import BasicManager from "../dao/managers/basicManager.js";

function generateCartId() {
  return uuidv4();
}
export class CartManager extends BasicManager {
  constructor(cartId) {
    super(cartsModel, "products.product");
    this.cartId = cartId;
  };

  async createCart(userId) {
    try {
      const newCart = new cartsModel();
      newCart.id = this.cartId || generateCartId();
      newCart.products = [];
      newCart.userId = userId || "";
      await newCart.save();
      return newCart;
    } catch (error) {
      throw error;
    }
  }

  async getCart(cartId) {
    try {
      const cart = await cartsModel
      .findOne({ id: cartId })
      return cart;
    } catch (error) {
      throw error;
    }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      const cart = await cartsModel.findOne({ id: cartId });
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }
      const product = await productsModel.findOne({ id: productId });
      if (!product) {
        throw new Error("Producto no encontrado");
      }
      const existingProduct = cart.products.find(
        (item) => item.product === productId
      );
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
      await cart.save();
      socketServer.emit("productAdded", {
        cartId: cart.id,
        productId,
        quantity,
      });
      return cart;
    } catch (error) {
      throw error;
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await cartsModel.findOne({ id: cartId });
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      const index = cart.products.findIndex(
        (item) => item.product === productId
      );
      if (index !== -1) {
        cart.products.splice(index, 1);
        await cart.save();
      }
      return cart;
    } catch (error) {
      throw error;
    }
  }
}
