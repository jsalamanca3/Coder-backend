import { cartsModel } from '../models/carts.model.js';
import RepositoryInterface from './repositoryInterface.js';
import { productsModel } from '../models/products.model.js';
import { socketServer } from '../../../app.js';
import { v4 as uuidv4 } from "uuid";
import { errorDictionary } from '../../../error/error.enum.js';

function generateCartId() {
    return uuidv4();
  }

class CartRepository extends RepositoryInterface {
    async createCart(userId) {
        try {
          const newCart = new cartsModel();
          newCart.id = this.cartId || generateCartId();
          newCart.products = [];
          newCart.userId = userId || '';
          await newCart.save();
          return newCart;
        } catch (error) {
          throw new Error({error: errorDictionary['CART_CREATION_ERROR']});
        }
      }

  async getCart(cartId) {
    try {
        const cart = await cartsModel
        .findOne({ id: cartId })
        return cart;
      } catch (error) {
        throw new Error({error: errorDictionary['CART_NOT_FOUND']});
      }
      }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
        const cart = await cartsModel.findOne({ id: cartId });
        if (!cart) {
          throw new Error({error: errorDictionary['CART_NOT_FOUND']});
        }
        const product = await productsModel.findOne({ id: productId });
        if (!product) {
          throw new Error({error: errorDictionary['PRODUCT_NOT_FOUND']});
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
        throw new Error({error: errorDictionary['CART_OPERATION_ERROR']});
      }
    }

  async removeProductFromCart(cartId, productId) {
    try {
        const cart = await cartsModel.findOne({ id: cartId });
        if (!cart) {
          throw new Error({error: errorDictionary['CART_NOT_FOUND']});
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
        throw new Error({error: errorDictionary['CART_NOT_FOUND']});
      }
    }
}

export default CartRepository;
