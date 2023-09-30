import express from 'express';
import cartsRouter from './router/carts.router.js';
import productRouter from './router/product.router.js';
import viewsRouter from './router/views.router.js';
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

socketServer.on('connection', (socket)  => {
  console.log("Cliente Conectado ${socket.id}");
  socket.on('disconnect', () => {
    console.log('Cliente desconectado ${socket.id}');
  })
});

 socketServer.on('connection', (socket) => {
  const products = [];
  socket.on('addProduct', (newProduct) => {
    products.push(newProduct);
    console.log('Producto agregado:', newProduct);
    socketServer.emit('productAdded', newProduct);
  });

  socket.on('deleteProduct', (productId) => {
    const deletedProduct = removeProductById(productId);
    if (deletedProduct) {
      socketServer.emit('productDeleted', productId);
    }
  });
});

export { socketServer };