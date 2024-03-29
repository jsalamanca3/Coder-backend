import { productsModel } from "../models/products.model.js";
import BasicManager from '../managers/basicManager.js';
import ProductRepository from "../Repository/productRepository.js";
export class ProductManager extends BasicManager {
  constructor() {
    super(productsModel);
    this.initialize();
  }
  initialize (){
    this.productRepository = new ProductRepository();
  }
}