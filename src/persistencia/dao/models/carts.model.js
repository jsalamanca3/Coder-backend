import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cartsSchema = new mongoose.Schema({
  id: String,
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      _id: false,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userId: String,
});

const cartsModel = model('Cart', cartsSchema);
export { cartsModel };