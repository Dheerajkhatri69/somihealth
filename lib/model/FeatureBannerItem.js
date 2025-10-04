import mongoose from "mongoose";

const FeatureBannerItemSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, index: true, default: "global" }, // group key if you ever need multiple banners
        label: { type: String, required: true }, // e.g., "Unlimited doctor support"
        icon: { type: String, required: true },  // e.g., "Stethoscope", "Globe", "Package", "Tag"
        order: { type: Number, default: 0, index: true },
        active: { type: Boolean, default: true },
        updatedBy: { type: String },
    },
    { timestamps: true }
);

FeatureBannerItemSchema.index({ key: 1, order: 1 });

export default mongoose.models.FeatureBannerItem ||
    mongoose.model("FeatureBannerItem", FeatureBannerItemSchema);
