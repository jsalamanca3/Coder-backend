import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cartsSchema = new mongoose.Schema({
    id: String,
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
      },
    ],
  });

const cartsModel = model('Cart', cartsSchema);
export { cartsModel};