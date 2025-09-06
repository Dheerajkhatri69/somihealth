const mongoose = require('mongoose');
require('dotenv').config();

// Import the model
const HowItWorks = require('../lib/model/howItWorks.js').default;

async function seedHowItWorks() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await HowItWorks.deleteMany({});
        console.log('Cleared existing How It Works data');

        // Create default content
        const defaultContent = {
            eyebrow: 'FEEL STRONGER, HEALTHIER, AND MORE CONFIDENT',
            mainTitle: 'How it works with Somi Health',
            mainTitleHighlight: 'with Somi Health',
            steps: [
                {
                    eyebrow: 'Unlock Your Best Self',
                    caption: 'You deserve this!',
                    title: '1. Take the Questionnaire',
                    description: 'Fill out a 7-minute questionnaire with your medical history, current health status, and weight-loss needs.',
                    icon: 'ClipboardList'
                },
                {
                    eyebrow: 'Virtual Help Available',
                    caption: 'Stay comfortable',
                    title: '2. Expert Guidance & Help',
                    description: 'Our licensed Nurse Practitioner reviews your form, confirms eligibility for GLP-1, and builds a safe, suitable plan.',
                    icon: 'Video'
                },
                {
                    eyebrow: 'Fast Shipping',
                    caption: 'Quick delivery',
                    title: '3. Receive Medication in 2–5 Days',
                    description: 'Once approved, your prescription is sent to the pharmacy. Expect your medication in 2–5 days with clear instructions.',
                    icon: 'Package'
                }
            ],
            ctaText: 'Start your journey',
            ctaLink: '/getstarted',
            isActive: true
        };

        // Insert the data
        const howItWorks = new HowItWorks(defaultContent);
        await howItWorks.save();

        console.log('How It Works content seeded successfully!');
        console.log('Created content with ID:', howItWorks._id);
    } catch (error) {
        console.error('Error seeding How It Works content:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seeding function
seedHowItWorks();
