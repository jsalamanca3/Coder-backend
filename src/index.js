const ProductManager = require("./ProductManager");

const productManager = new ProductManager("productos.json");

productManager.addProduct({
  title: "Soy un producto",
  description: "Descripción del Producto 1",
  price: 1700,
  thumbnail: "imagen1.jpg",
  code: "001",
  stock: 50,
});

const productById = productManager.getProductById(1);
if (productById !== null) {
  console.log(productById);
} else {
  console.log("Producto no encontrado");
}

const updatedProduct = productManager.updateProduct(1, {
  price: 2400,
  stock: 15,
});
if (updatedProduct !== null) {
  console.log(updatedProduct);
} else {
  console.log("Producto no encontrado para actualizar");
}

const isDeleted = productManager.deleteProduct(1);
if (isDeleted) {
  console.log("Producto eliminado exitosamente");
} else {
  console.log("Producto no encontrado para eliminar");
}

productManager.saveProducts();