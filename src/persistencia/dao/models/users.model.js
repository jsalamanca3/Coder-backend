import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "premium", "user"],
        default: "user",
    },
    from_github: {
        type: Boolean,
        default: false,
    },
    from_google: {
        type: Boolean,
        default: false,
    },
   cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
    },
    resetToken: {
        token: String,
        used: {
          type: Boolean,
          default: false,
        },
    },
    documents: [
        {
            name: String,
            reference: String
        }
    ],
    documentsProcessed: {
        type: Boolean,
        default: false,
    },
    last_connection: {
        type: Date,
        default: null
    },
});

const usersModel = model('User', userSchema);
export { usersModel };