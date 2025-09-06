const mongoose = require('mongoose');
const BMIContent = require('../lib/model/bmiContent.js').default;
const { connectionSrt } = require('../lib/db.js');

async function seedBMIContent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionSrt);
    console.log('Connected to MongoDB');

    // Clear existing BMI content
    await BMIContent.deleteMany({});
    console.log('Cleared existing BMI content');

    // Create default BMI content
    const defaultContent = new BMIContent({
      title: 'See how much weight you could lose — how different life could feel.',
      description: 'Backed by real medicine and real results, somi helps you reach your goals without constant hunger or unsustainable plans. Just choose your starting point to see what\'s possible.',
      image: '/hero/bmilady.png',
      isActive: true
    });

    await defaultContent.save();
    console.log('Created default BMI content:', defaultContent.title);

    console.log('BMI content seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding BMI content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedBMIContent();
