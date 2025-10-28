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
        idname: { type: String, required: true }, // e.g. "semaglutide", "tirzepatide"
        price: { type: PriceSchema, default: () => ({}) },
        href: { type: String, default: '' },
        image: { type: String, default: '' },
    },
    { _id: false }
);

const GuaranteeSchema = new Schema(
    {
        title: { type: String, default: 'Money Back Guarantee' },
        lines: { type: [String], default: ['100% Money Back', 'Guarantee', 'FSA and HSA Accepted'] },
        refundText: {
            type: String,
            default:
                'We will refund 100% of your money if our licensed clinician determines you are not eligible for GLP-1 weight loss therapy.',
        },
    },
    { _id: false }
);

const PricingWeightLossSchema = new Schema(
    {
        heading: { type: String, default: 'Ready To Start Your Weight Loss Journey?' },
        subheading: { type: String, default: 'View Our Pricing' },
        brand: { type: String, default: 'somi' },
        backLabel: { type: String, default: 'Back' },
        backHref: { type: String, default: '/pricing' },
        options: { type: [OptionSchema], default: [] },
        badges: {
            type: [
                {
                    src: String,
                    alt: String,
                    w: Number,
                    h: Number,
                },
            ],
            default: [
                { src: '/pricing/certified.png', alt: 'Certified', w: 96, h: 96 },
                { src: '/pricing/guaranteed.png', alt: 'Guaranteed', w: 112, h: 112 },
            ],
        },
        guarantee: { type: GuaranteeSchema, default: () => ({}) },
        config: { type: Object, default: { isActive: true } },
    },
    { timestamps: true }
);

const PricingWeightLoss =
    models.PricingWeightLoss || model('PricingWeightLoss', PricingWeightLossSchema);

export default PricingWeightLoss;