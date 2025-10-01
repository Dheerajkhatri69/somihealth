import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
    {
        label: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 }, // store as number
        link: { type: String, default: "" },
        sortOrder: { type: Number, default: 0 },         // <— option sort
    },
    { _id: false }
);

const medicationPricingSchema = new mongoose.Schema(
    {
        product: { type: String, required: true, lowercase: true, trim: true, unique: true }, // "semaglutide"
        name: { type: String, required: true, trim: true },                                   // "Semaglutide"
        image: { type: String, default: "" },                                                 // image url
        options: { type: [optionSchema], default: [] },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },                                              // <— product sort
    },
    { timestamps: true }
);

medicationPricingSchema.index({ sortOrder: 1 });

const MedicationPricing =
    mongoose.models.MedicationPricing ||
    mongoose.model("MedicationPricing", medicationPricingSchema);

export default MedicationPricing;
