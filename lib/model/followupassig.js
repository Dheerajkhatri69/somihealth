import mongoose from "mongoose";

const FollowupassigSchema = new mongoose.Schema({
    cid: {
        type: String,
    },
    pid: {
        type: String,
    }, 
});

export const Followupassig = mongoose.models.Followupassig || mongoose.model("Followupassig", FollowupassigSchema);