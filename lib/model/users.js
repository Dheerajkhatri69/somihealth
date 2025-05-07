import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true, // Ensure uniqueness
    },
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    accounttype: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

export const user = mongoose.models.User || mongoose.model("User", UserSchema);
