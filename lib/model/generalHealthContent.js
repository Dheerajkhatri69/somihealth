import mongoose from 'mongoose';

/* existing partnerItemSchema + featureGroupSchema stay as-is above... */

const compareRowSchema = new mongoose.Schema({
    label: { type: String, required: true },
    left: { type: String, required: true },
    right: { type: String, required: true },
}, { _id: false });

const healthPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    blurb: { type: String, required: true },
    priceLabel: { type: String, required: true },
    features: [{ type: String, required: true }]
}, { _id: false });

const partnerItemSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    icon: {
        src: { type: String, required: true },
        alt: { type: String, default: '' },
        width: { type: Number, default: 80 },
        height: { type: Number, default: 80 }
    }
}, { _id: false });

const featureGroupSchema = new mongoose.Schema({
    title: { type: String, required: true },
    items: [{ type: String, required: true }]
}, { _id: false });

const generalHealthContentSchema = new mongoose.Schema({
    hero: {
        heading: { type: String, required: true, default: "Your General Health physician online" },
        subheading: { type: String, required: true, default: "Partnering you with a doctor who really gets to know you, listens to you, and has time for you." },
        priceNote: { type: String, default: "Starting at $99/month for individuals or $178 for your entire family" },
        ctaLabel: { type: String, default: "Get started" },
        ctaHref: { type: String, default: "/getstarted" },
        image: {
            src: { type: String, default: "https://assets.lemonaidhealth.com/web/brochure/images/primary-care/Lemonaid_MD_page_Hero_image_desktop.png" },
            alt: { type: String, default: "Person at home on laptop with a dog" }
        }
    },

    partner: {
        heading: { type: String, required: true, default: "How we partner you with the perfect doctor" },
        items: { type: [partnerItemSchema], default: [] }
    },

    features: {
        heading: { type: String, required: true, default: "Get the primary care you need, whenever you need it" },
        intro: { type: String, default: "" },
        image: {
            src: { type: String, default: "https://assets.lemonaidhealth.com/web/brochure/images/primary-care/Lemonaid_MD_page_Hero_image_desktop.png" },
            alt: { type: String, default: "Friendly doctor chatting with patient online" }
        },
        groups: { type: [featureGroupSchema], default: [] }
    },

    glowCompare: {
        title: { type: String, default: "Exceptional primary care that gets easier each year" },
        firstTitle: { type: String, default: "Feature" },
        leftTitle: { type: String, default: "Traditional" },
        rightTitle: { type: String, default: "Lemonaid" },
        rows: { type: [compareRowSchema], default: [] }
    },

    healthPlans: {
        title: { type: String, default: "Health coverage for you and your loved ones" },
        subtitle: { type: String, default: "Choose the plan that’s right for you, no insurance required" },
        image: {
            src: { type: String, default: "/hero-family.jpg" },
            alt: { type: String, default: "Smiling parent with kids" }
        },
        plans: { type: [healthPlanSchema], default: [] }
    },

    config: {
        isActive: { type: Boolean, default: true }
    }
}, { timestamps: true });

generalHealthContentSchema.index(
    { 'config.isActive': 1 },
    { unique: true, partialFilterExpression: { 'config.isActive': true } }
);

const GeneralHealthContent =
    mongoose.models.GeneralHealthContent ||
    mongoose.model('GeneralHealthContent', generalHealthContentSchema);

export default GeneralHealthContent;
