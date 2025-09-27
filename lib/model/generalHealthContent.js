import mongoose from 'mongoose';

const partnerItemSchema = new mongoose.Schema({
    id: { type: Number, required: true }, // keep numeric id to preserve order if you like
    title: { type: String, required: true },
    desc: { type: String, required: true },
    icon: {
        src: { type: String, required: true },   // store uploaded URL
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

    config: {
        isActive: { type: Boolean, default: true }
    }
}, { timestamps: true });

// Only one active document at a time
generalHealthContentSchema.index({ 'config.isActive': 1 }, { unique: true, partialFilterExpression: { 'config.isActive': true } });

const GeneralHealthContent = mongoose.models.GeneralHealthContent || mongoose.model('GeneralHealthContent', generalHealthContentSchema);
export default GeneralHealthContent;
