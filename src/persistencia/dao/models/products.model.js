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
        enum: ["available", "sold"],
        default: 'available',
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    thumbnails: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
})

productsSchema.plugin(mongoosePaginate);
const productsModel = model('Product', productsSchema);
export { productsModel };