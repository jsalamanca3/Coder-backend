import fs from 'fs';

export default class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.loadProducts();
  }

   async loadProducts() {
    try {
      const data = await fs.readFileSync(this.path, 'utf8');
      this.products = JSON.parse(data);
    } catch (error) {
      this.products = [];
    }
  }

  async saveProducts() {
    await fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2), 'utf8');
  }

  async addProduct(product) {
    const newProduct = {
      id: this.products.length + 1,
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
    return this.products.find((product) => product.id === id);
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
}