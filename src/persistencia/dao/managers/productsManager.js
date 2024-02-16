import { productsModel } from "../models/products.model.js";
import BasicManager from "./basicManager.js";
import { faker } from '@faker-js/faker';
import { errorDictionary } from "../../../error/error.enum.js";

class ProductsManager extends BasicManager {
  constructor() {
    super(productsModel);
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
        throw new Error({error: errorDictionary['PRODUCT_NOT_FOUND']});
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
        throw new Error({error: errorDictionary['PRODUCT_NOT_FOUND']});
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
        throw new Error({error: errorDictionary['PRODUCT_NOT_FOUND']});
      }
      return deletedProduct;
    } catch (error) {
      throw error;
    }
  };

  async generateMockProducts() {
    await productsModel.deleteMany({});
    const mockProducts = [];
    for (let i = 1; i <= 100; i++) {
      const product = new productsModel({
        title: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        code: faker.datatype.uuid(),
        price: faker.datatype.number({ min: 1, max: 100 }),
        status: "available",
        stock: faker.datatype.number({ min: 1, max: 100 }),
        thumbnails: faker.image.imageUrl(),
        category: faker.commerce.department(),
      });
      await product.save();
      mockProducts.push(product);
    }
    return mockProducts;
  } catch (error) {
    throw new Error({error: errorDictionary['ERROR_SIMULATING_PRODUCTS']});
  }
}

export const productsManager = new ProductsManager();