import mongoose from "mongoose";

const AssigningSchema = new mongoose.Schema({
    cid: {
        type: String,
    },
    pid: {
        type: String,
    },
    createTimeDate: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const Assigning = mongoose.models.Assigning || mongoose.model("Assigning", AssigningSchema);