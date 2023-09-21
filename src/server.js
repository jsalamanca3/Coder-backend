import express from 'express';
import cartsRouter from './router/carts.router.js';
import productRouter from './router/product.router.js';

const app = express();

const port = process.env.PORT || 8080;


app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/carts", cartsRouter)


app.listen(port, () => {
  console.log(`Escuchando al puerto ${port}`);
});