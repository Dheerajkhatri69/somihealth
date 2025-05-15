import mongoose from "mongoose";

const CreatorofpSchema = new mongoose.Schema({
    tid: {
        type: String,
    },
    tname: {
        type: String,
    },
    pid: {
        type: String,
    }, 
});

export const Creatorofp = mongoose.models.Creatorofp || mongoose.model("Creatorofp", CreatorofpSchema);