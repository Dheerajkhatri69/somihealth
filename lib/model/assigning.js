import mongoose from "mongoose";

const AssigningSchema = new mongoose.Schema({
    cid: {
        type: String,
    },
    pid: {
        type: String,
    }, 
});

export const Assigning = mongoose.models.Assigning || mongoose.model("Assigning", AssigningSchema);