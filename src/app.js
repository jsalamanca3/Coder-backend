import express from 'express';
import cartsRouter from './router/carts.router.js';
import productRouter from './router/product.router.js';
import viewsRouter from './router/views.router.js';
import http from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* handlebars */
app.engine('handlebars', engine({ defaultLayouts: 'main' }));
app.set('view engine', 'handlebars');

const port = process.env.PORT || 8080;

/* Routers */
app.use("/api/products", productRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/", viewsRouter);


app.listen(port, () => {
  console.log(`Escuchando al puerto ${port}`);
});

/* server Websocket */

io.on('connection', (socket) => {
  const products = [];
  socket.on('addProduct', (newProduct) => {
    products.push(newProduct);
    console.log('Producto agregado:', newProduct);
    io.emit('productAdded', newProduct);
  });

  socket.on('deleteProduct', (productId) => {
    const deletedProduct = removeProductById(productId);
    if (deletedProduct) {
      io.emit('productDeleted', productId);
    }
  });

});

export { io };