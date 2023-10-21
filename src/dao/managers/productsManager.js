import { productsModel } from "../models/products.model.js";
import BasicManager from "./basicManager.js";

class ProductsManager extends BasicManager {
    constructor(){
        super(productsModel)
    }

    async getAllProducts() {
      try {
        const products = await productsModel.find();
        return products;
      } catch (error) {
        throw error;
      }
    }

    async getProductById(productId) {
      try {
        const product = await productsModel.findById(productId);
        if (!product) {
          throw new Error('Producto no encontrado');
        }
        return product;
      } catch (error) {
        throw error;
      }
    }

    async addProduct(productData) {
      try {
        const newProduct = new productsModel(productData);
        await newProduct.save();
        return newProduct;
      } catch (error) {
        throw error;
      }
    }

    async updateProduct(productId, updatedProductData) {
      try {
        const updatedProduct = await productsModel.findByIdAndUpdate(
          productId,
          updatedProductData,
          { new: true }
        );
        if (!updatedProduct) {
          throw new Error('Producto no encontrado');
        }
        return updatedProduct;
      } catch (error) {
        throw error;
      }
    }

    async deleteProduct(productId) {
      try {
        const deletedProduct = await productsModel.findByIdAndRemove(productId);
        if (!deletedProduct) {
          throw new Error('Producto no encontrado');
        }
        return deletedProduct;
      } catch (error) {
        throw error;
      }
    }
}

export const productsManager = new ProductsManager();