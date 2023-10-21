import mongoose from "mongoose";
import mongoosePaginate from "paginate/lib/mongoose-paginate.js";

const { Schema, model } = mongoose;

const productsSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    code:{
        type: String,
        requered: true
    },
    price:{
        type:Number,
        required: true
    },
    status:{
        type: String,
        enum: ["available", "sold"]
      },
    stock:{
        type:Number,
        default: 0
    },
    thumbnails: {
        type: String,
        requered: true
    },
    category: {
        type: String,
        requered: true
    }
})
productsSchema.plugin[mongoosePaginate];
const productsModel = model('Product', productsSchema);
export { productsModel };