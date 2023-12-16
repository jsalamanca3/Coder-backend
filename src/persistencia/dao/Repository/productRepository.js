import { productsModel } from '../models/products.model.js';
import RepositoryInterface from './repositoryInterface.js';
import { v4 as uuidv4 } from 'uuid';
import { errorDictionary } from '../../../error/error.enum.js';
class ProductRepository extends RepositoryInterface {
      async addProduct(product) {
        const newProduct = new productsModel({
          id: uuidv4(),
          ...product,
        });
        try {
          await newProduct.save();
          return newProduct;
        } catch (error) {
          throw new Error({error: errorDictionary['PRODUCT_NOT_FOUND'] `${error.message}`});
        }
      }
      async getProducts(filters = {}, sort = {}) {
        try {
          const products = await productsModel.paginate(filters).sort(sort).exec();
          return products;
        } catch (error) {
          throw new Error({error: errorDictionary['PRODUCT_NOT_FOUND'] `${error.message}`});
        }
      }
      async getProductById(id) {
        const product = await productsModel.findOne({ id }).exec();
        if (!product) {
          throw new Error({error: errorDictionary['PRODUCT_NOT_FOUNT']});
        }
        return product;
      }
      async updateProduct(id, updatedProduct) {
        const product = await productsModel.findOneAndUpdate({ id }, updatedProduct, { new: true }).exec();
        if (product) {
          return product;
        }
        return null;
      }
      async deleteProduct(id) {
        const result = await productsModel.findOneAndDelete({ id }).exec();
        if (result) {
          return true;
        }
        return false;
      }
}

export default ProductRepository;
