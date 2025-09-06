const mongoose = require('mongoose');
const HeroText = require('../lib/model/heroText.js').default;
const { connectionSrt } = require('../lib/db.js');

async function seedHeroText() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionSrt);
    console.log('Connected to MongoDB');

    // Clear existing hero text
    await HeroText.deleteMany({});
    console.log('Cleared existing hero text');

    // Create default hero text
    const defaultHeroText = new HeroText({
      mainTitle: 'Look Better, Feel Better, Live Better.',
      rotatingLines: [
        'No hidden fees. No hassle. Just results.',
        'Custom plans. Real help. Real care.',
      ],
      isActive: true,
      sortOrder: 0
    });

    await defaultHeroText.save();
    console.log('Created default hero text:', defaultHeroText);

    console.log('Hero text seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding hero text:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedHeroText();
