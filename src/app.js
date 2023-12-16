import express from 'express';
import { __dirname } from "./utils.js";
import cartsRouter from './router/carts.router.js';
import productRouter from './router/product.router.js';
import viewsRouter from './router/views.router.js';
import usersRouter from './router/user.router.js';
import loginRouter from './router/login.router.js';
import sessionRouter from './router/sessions.router.js';
import { ProductManager } from './persistencia/dao/functions/ProductManager.js';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import "./config/configDB.js";
import chatRouter from './router/chat.router.js';
import { messageModel } from './persistencia/dao/models/messages.models.js';
import session from "express-session";
import mongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import passport from 'passport';
import './passport.js';
import config from './config/config.js';
import mockingProducts from './router/mockingproducts.js';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

/* handlebars */
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set("views", __dirname + "/views");


/* session Mongo */
const MONGODB_URI = config.mongo_uri;
app.use(
  session({
    secret: config.session_secret,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
    store: new mongoStore({
      mongoUrl: MONGODB_URI,
    }),
  })
);

/* passport */
app.use(passport.initialize());
app.use(passport.session());

/* Routers */
app.use("/", viewsRouter);
app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/products", productRouter);
app.use("/api/createproducts", productRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/mockingproducts", mockingProducts);

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

  socket.on('newUser', (user) => {
    socket.emit('chatMessage', { user: 'Chat Bot', message: `¡Bienvenid@, ${user}!` });
    socket.broadcast.emit('chatMessage', { user: 'Chat Bot', message: `${user} se ha unido al chat.` });
  });

  socket.on('message', async (data) => {
    console.log('Datos de mensaje recibidos:', data);

    if (data && isValidEmail(data.email) && isValidMessage(data.message)) {
      try {
        const newMessage = new messageModel({ email: data.email, message: data.message, processed: true });
        console.log('Mensaje guardado en la base de datos:', newMessage);
        socket.broadcast.emit('chatMessage', newMessage);
        console.log('Mensaje emitido al chat:', newMessage);
      } catch (error) {
        console.error('Error al guardar el mensaje:', error);
      }
    } else {
      socket.emit('messageError', 'Los datos del mensaje son incorrectos.');
    }
  });

  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function isValidMessage(message) {
    return message && message.trim() !== '';
  }

});

export { socketServer };