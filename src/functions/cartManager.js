import { cartsModel } from '../dao/models/carts.model.js';
import { productsModel } from '../dao/models/products.model.js';
import { socketServer } from '../app.js';

class CartManager {
  constructor(cartId) {
    this.cartId = cartId;
  }

  async createCart() {
    try {
      const newCart = new cartsModel();
      newCart.id = this.cartId;
      newCart.products = [];
      await newCart.save();
      return newCart;
    } catch (error) {
      throw error;
    }
  }

  async getCart(cartId) {
    try {
      const cart = await cartsModel.findOne({ id: cartId });
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

      const existingProduct = cart.products.find((item) => item.product === productId);

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();

      const addedProduct = {
        cartId: cart.id,
        productId,
        quantity,
      };

      socketServer.emit('productAdded', addedProduct);

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

      const index = cart.products.findIndex((item) => item.product === productId);
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

export default CartManager;