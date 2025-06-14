import mongoose from "mongoose";

const FollowupassigSchema = new mongoose.Schema({
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

export const Followupassig = mongoose.models.Followupassig || mongoose.model("Followupassig", FollowupassigSchema);