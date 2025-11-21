import mongoose from "mongoose";

const footerBlockSchema = new mongoose.Schema({
  type: { type: String, required: true }, // heading, subheading, paragraph, list
  text: String,
  items: [String], // for list
});

const footerPageSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }, // hipaa, terms
  blocks: [footerBlockSchema],

  config: {
    isActive: { type: Boolean, default: true }
  }
}, { timestamps: true });

const FooterPage =
  mongoose.models.FooterPage || mongoose.model("FooterPage", footerPageSchema);

export default FooterPage;
