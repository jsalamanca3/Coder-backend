import { cartsModel } from "../models/carts.model.js";
import BasicManager from "../managers/basicManager.js";
import CartRepository from "../Repository/cartRepository.js";


export class CartManager extends BasicManager {
  constructor(cartId) {
    super(cartsModel, "products.product");
    this.cartId = cartId;
  };

  initialize() {
    const cartRepository = new CartRepository();
  }

}
