import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productsSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    price:{
        type:Number,
        required: true
    },
    stock: {
        type:Number,
        default: 0
    },
    description: {
        type: String,
    }
})

const productsModel = model('Product', productsSchema);
export { productsModel };