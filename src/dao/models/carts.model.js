import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cartsSchema = new Schema({
    id:{
        type: String,
        required: true
    },
    products:{
        type: String,
        required: true
    }
})

const cartsModel = model('Cart', cartsSchema);
export { cartsModel};