import mongoose from "mongoose";

const UserCredentialSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const UserCredential = mongoose.models.UserCredential || mongoose.model("UserCredential", UserCredentialSchema);
