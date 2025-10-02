import mongoose from "mongoose";

const ReviewHeaderSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true, index: true }, // e.g. "client-reviews-header"
        text: { type: String, required: true },                           // e.g. "From stuck to thriving."
        updatedBy: { type: String },                                       // optional
    },
    { timestamps: true }
);

// Avoid OverwriteModelError in Next.js dev
export default mongoose.models.ReviewHeader ||
    mongoose.model("ReviewHeader", ReviewHeaderSchema);
