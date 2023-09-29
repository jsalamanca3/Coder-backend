import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf8');
      this.products = JSON.parse(data);
    } catch (error) {
      throw new Error(`Sea producido un Error al cargar el producto: ${error.message}`);
    }
  }

  async saveProducts() {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf8');
    } catch (error) {
      throw new Error(` Sea producido un Error al guardar el producto: ${error.message}`);
    }
  }

  async addProduct(product) {
    const newProduct = {
      id: uuidv4(),
      ...product,
    };
    this.products.push(newProduct);
    await this.saveProducts();
    return newProduct;
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    const product = this.products.find((product) => product.id === id);
  if (!product) {
    throw new Error("Producto no encontrado");
  }
  return product;
  }

  async updateProduct(id, updatedProduct) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedProduct };
      await this.saveProducts();
      return this.products[index];
    }
    return null;
  }

  async deleteProduct(id) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      await this.saveProducts();
      return true;
    }
    return false;
  }
  async removeProductById(productId) {
    try {
      const index = this.products.findIndex((product) => product.id === productId);
      if (index !== -1) {
        const deletedProduct = this.products.splice(index, 1)[0];
        await this.saveProducts();
        return deletedProduct;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
}


const productManager = new ProductManager('./productos.json');
export { productManager };
export default productManager;