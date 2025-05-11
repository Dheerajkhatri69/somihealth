import mongoose from "mongoose";

const EmailhisSchema = new mongoose.Schema({
    pid: { type: String, required: true },
    pname: { type: String, required: true },
    cid: { type: String, required: true },
    cname: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: String, required: true }
});

// ✅ Make sure you use the correct model name and avoid .models.User
export const Emailhis = mongoose.models.Emailhis || mongoose.model("Emailhis", EmailhisSchema);
