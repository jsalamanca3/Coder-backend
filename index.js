class Product {
    constructor(title, description, price, thumbnail, code, stock) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
    }
}

class ProductManager {
    constructor() {
        this.products = [];
        this.nextProductId = 1;
    }

    addProduct(title, description, price, thumbnail, code, stock) {
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.log("Todos los campos son obligatorios.");
            return;
        }

        if (this.products.some(product => product.code === code)) {
            console.log(`Ya existe un producto con el código ${code}.`);
            return;
        }

        const newProduct = new Product(title, description, price, thumbnail, code, stock);
        newProduct.id = this.nextProductId++;
        this.products.push(newProduct);
        console.log(`Producto "${title}" agregado con éxito.`);
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const product = this.products.find(product => product.id === id);
        if (!product) {
            console.log("Not Found");
        }
        return product;
    }
}

// Ejemplo
const manager = new ProductManager();
manager.addProduct("Camiseta", "Una camiseta", 50, "camiseta.jpg", "1", 10);
manager.addProduct("Pantalón", "Un pantalón", 70, "pantalon.jpg", "2", 15);

console.log(manager.getProducts());

const product = manager.getProductById(2);
if (product) {
    console.log("Producto encontrado:", product);
}

const nonExistentProduct = manager.getProductById(999); // Producto no existente
