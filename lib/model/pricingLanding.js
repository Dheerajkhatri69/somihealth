import mongoose, { Schema, models, model } from 'mongoose';

const PriceSchema = new Schema(
    {
        note: { type: String, default: '' },
        amount: { type: Number, default: 0 },
        unit: { type: String, default: '' },
    },
    { _id: false }
);

const OptionSchema = new Schema(
    {
        title: { type: String, required: true },
        idname: { type: String, required: true }, // e.g. "weightloss"
        price: { type: PriceSchema, default: () => ({}) },
        href: { type: String, default: '' },
        image: { type: String, default: '' },
        // ⭐ NEW FIELDS
        bannerBehind: { type: String, default: '' },   // text
        bannerBehindShow: { type: Boolean, default: false }, // show/hide
    },
    { _id: false }
);

const PayLogoSchema = new Schema(
    { src: { type: String, required: true }, alt: { type: String, required: true } },
    { _id: false }
);

const BadgeSchema = new Schema(
    {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        w: { type: Number, default: 96 },
        h: { type: Number, default: 96 },
    },
    { _id: false }
);

const ConfigSchema = new Schema({ isActive: { type: Boolean, default: true } }, { _id: false });

const PricingLandingSchema = new Schema(
    {
        brand: { type: String, default: 'somi' },
        backLabel: { type: String, default: 'Back' },
        backUrl: { type: String, default: 'https://joinsomi.com/' },
        title: { type: String, default: 'What is your primary health goal?' },
        subtitle: { type: String, default: 'View Our Pricing' },

        payLaterPrefix: { type: String, default: 'Buy now, pay later with' },
        refundCopy: {
            type: String,
            default:
                "We will refund 100% of your money if our licensed clinician determines you are not eligible for GLP-1 weight loss therapy.",
        },

        guaranteeLines: { type: [String], default: ['100% Money Back', 'Guarantee', 'FSA and HSA Accepted'] },
        badges: { type: [BadgeSchema], default: [] },
        payLogos: { type: [PayLogoSchema], default: [] },
        options: { type: [OptionSchema], default: [] },

        config: { type: ConfigSchema, default: () => ({ isActive: true }) },
    },
    { timestamps: true }
);

const PricingLanding = models.PricingLanding || model('PricingLanding', PricingLandingSchema);
export default PricingLanding;