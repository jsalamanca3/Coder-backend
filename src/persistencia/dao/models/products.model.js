import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema, model } = mongoose;

const productsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    code: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["available", "sold"]
    },
    stock: {
        type: Number,
        default: 0
    },
    thumbnails: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
})

productsSchema.plugin(mongoosePaginate);
const productsModel = model('Product', productsSchema);
export { productsModel };