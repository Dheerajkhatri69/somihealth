const mongoose = require('mongoose');
const CompoundedContent = require('../lib/model/compoundedContent.js').default;
const { connectionSrt } = require('../lib/db.js');

async function seedCompoundedContent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionSrt);
    console.log('Connected to MongoDB');

    // Clear existing compounded content
    await CompoundedContent.deleteMany({});
    console.log('Cleared existing compounded content');

    // Create default compounded content
    const defaultContent = new CompoundedContent({
      title: 'What are Compounded GLP-1 Medications?',
      description: 'Compounded GLP-1 medications are personalized versions of treatments like Semaglutide or Tirzepatide. They\'re made by licensed compounding pharmacies based on a prescription from a qualified healthcare provider. They contain the same active ingredient as the branded medications, but are compounded to offer a more personalized and often more accessible option.',
      image: '/hero/bmilady.png',
      isActive: true
    });

    await defaultContent.save();
    console.log('Created default compounded content:', defaultContent.title);

    console.log('Compounded content seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding compounded content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedCompoundedContent();
