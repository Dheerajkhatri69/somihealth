import mongoose from "mongoose";

const subHeroSchema = new mongoose.Schema({
    eyebrow: { type: String, default: "" },
    heading: { type: String, required: true },
    subheading: { type: String, default: "" },
    ctaLabel: { type: String, default: "" },
    ctaHref: { type: String, default: "" },
    priceNote: { type: String, default: "" },
    disclaimer: { type: String, default: "" },
    image: {
        src: { type: String, default: "" },
        alt: { type: String, default: "" },
        width: { type: Number, default: 520 },
        height: { type: Number, default: 520 },
    },
}, { _id: false });

const stepsSchema = new mongoose.Schema({
    heading: { type: String, default: "" },
    steps: [{
        title: { type: String, required: true },
        desc: { type: String, required: true },
    }]
}, { _id: false });

const treatmentSchema = new mongoose.Schema({
    heading: { type: String, default: "" },
    intro: { type: String, default: "" },
    items: [{
        title: { type: String, required: true },
        desc: { type: String, required: true },
        icon: { type: String, default: "" }, // URL
    }]
}, { _id: false });

const sectionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    heading: { type: String, required: true },
    bgcolour: { type: String, default: "fffaf6" },
    point: [{ type: String, required: true }],
}, { _id: false });

const ghEntrySchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, index: true }, // e.g., 'high-blood-pressure'
    context: {
        subHero: subHeroSchema,
        steps: stepsSchema,
        treatment: treatmentSchema,
        sections: [sectionSchema],
    },
    config: {
        isActive: { type: Boolean, default: true }
    }
}, { timestamps: true });

const GHEntry = mongoose.models.GHEntry || mongoose.model("GHEntry", ghEntrySchema);
export default GHEntry;
