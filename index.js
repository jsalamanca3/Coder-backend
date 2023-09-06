const ProductManager = require('./ProductManager');

const productManager = new ProductManager('productos.json');


productManager.addProduct({
  title: 'Soy un producto',
  description: 'Descripción del Producto 1',
  price: 1700,
  thumbnail: 'imagen1.jpg',
  code: '001',
  stock: 50,
});

const allProducts = productManager.getProducts();
console.log(allProducts);


const productById = productManager.getProductById(1);
console.log(productById);

const updatedProduct = productManager.updateProduct(1, {
  price: 2400,
  stock: 15,
});
console.log(updatedProduct);

const isDeleted = productManager.deleteProduct(1);
console.log(isDeleted);
