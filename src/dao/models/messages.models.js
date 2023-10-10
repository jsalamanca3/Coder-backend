import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    }
})

const messageModel = model('Message', messageSchema);
export { messageModel };