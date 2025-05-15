import mongoose from "mongoose";

const FollowupcreatorofpSchema = new mongoose.Schema({
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

export const Followupcreatorofp = mongoose.models.Followupcreatorofp || mongoose.model("Followupcreatorofp", FollowupcreatorofpSchema);