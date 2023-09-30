import express from 'express';
import cartsRouter from './router/carts.router.js';
import productRouter from './router/product.router.js';
import viewsRouter from './router/views.router.js';
import { ProductManager } from './functions/ProductManager.js';
import { __dirname } from "./utils.js";
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

/* handlebars */
app.engine('handlebars', engine());
app.set("views", __dirname + "/views");
app.set('view engine', 'handlebars');

/* Routers */
app.use("/api/products", productRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

const PORT = 8080;

const httpServer = app.listen(PORT, () => {
  console.log(`Escuchando al puerto ${PORT}`);
});

const socketServer = new Server(httpServer);

/* server Websocket */

socketServer.on('connection', (socket) => {
  const productManager = new ProductManager('./productos.json');
  console.log(`Cliente conectado ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado ${socket.id}`);
  });

  socket.on('addProduct', async (newProduct) => {
    try {
      const addedProduct = await productManager.addProduct(newProduct);
      console.log('Producto agregado:', addedProduct);
      socketServer.emit('productAdded', addedProduct);
    } catch (error) {
      console.error('Error al agregar producto:', error.message);
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      const deletedProduct = await productManager.removeProductById(productId);
      if (deletedProduct) {
        socketServer.emit('productDeleted', productId);
        console.log('Producto eliminado:', deletedProduct);
      } else {
        console.log('Producto no encontrado o no se pudo eliminar.');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error.message);
    }
  });
});


export { socketServer };