import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ticketSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true,
      },
      purchase_datetime: {
        type: Date,
        default: Date.now,
      },
      amount: {
        type: Number,
        required: true,
      },
      purchaser: {
        type: String,
        required: true,
      },
})

const ticketModel = model('Ticket', ticketSchema);
export { ticketModel };