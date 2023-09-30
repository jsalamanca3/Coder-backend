import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { socketServer } from '../app.js';

class CartManager {
  constructor(cartId) {
    this.cartId = cartId;
    this.cartFilePath = `carrito.json`;
  }

  async createCart() {
    try {
      const cartId = uuidv4();
      const newCart = {
        id: cartId,
        products: [],
      };
      await fs.writeFile(this.cartFilePath, JSON.stringify(newCart, null, 2), 'utf8');
      return newCart;
    } catch (error) {
      throw error;
    }
  }

  async getCart() {
    try {
      const data = await fs.readFile(this.cartFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw error;
    }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      const cartFilePath = `carrito.json`;
      let cart = { id: cartId, products: [] };

      try {
        const cartData = await fs.readFile(cartFilePath, "utf8");
        cart = JSON.parse(cartData);
      } catch (error) {}

      const existingProduct = cart.products.find((item) => item.product === productId);

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await fs.writeFile(cartFilePath, JSON.stringify(cart, null, 2), "utf8");

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

  async removeProductFromCart(productId) {
    try {
      const cart = await this.getCart();
      const index = cart.products.findIndex((item) => item.product === productId);
      if (index !== -1) {
        cart.products.splice(index, 1);
        await fs.writeFile(this.cartFilePath, JSON.stringify(cart, null, 2), 'utf8');
      }
      return cart;
    } catch (error) {
      throw error;
    }
  }
}

export default CartManager;