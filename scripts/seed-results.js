const mongoose = require('mongoose');
require('dotenv').config();

// Import the model
const Results = require('../lib/model/results.js').default;

async function seedResults() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Results.deleteMany({});
        console.log('Cleared existing Results data');

        // Create default content
        const defaultContent = {
            tabs: [
                {
                    title: "Research",
                    value: "research",
                    color: "#3B82F6",
                    bg: "#EAF2FF",
                    bgActive: "#DCEAFF",
                    bullets: ["Years Of Research", "Reliable Medications", "Science-Backed Treatments"],
                    body: "At Somi Health, we offer GLP-1 and GIP/GLP-1 therapies, including compounded Semaglutide and Tirzepatide, supporting safe and effective weight management.",
                    icon: "Beaker"
                },
                {
                    title: "Pricing",
                    value: "pricing",
                    color: "#10B981",
                    bg: "#EAF7F1",
                    bgActive: "#D7F2E6",
                    bullets: ["No Hidden Fees.", "No Gimmicks.", "Transparent Pricing"],
                    body: "Our pricing is clear, straightforward, and free from hidden costs, giving you full confidence in knowing exactly what you're paying for and what to expect throughout your journey.",
                    icon: "BadgeDollarSign"
                },
                {
                    title: "Safety",
                    value: "safety",
                    color: "#EC4899",
                    bg: "#FCE7F3",
                    bgActive: "#FBCFE8",
                    bullets: ["FDA Approved", "Safe & Effective", "Safety & Quality Guaranteed"],
                    body: "All medications are sourced from FDA-overseen, 503(a) pharmacies and undergo strict third-party testing to ensure your safety and the highest quality standards.",
                    icon: "ShieldCheck"
                }
            ],
            watermark: {
                text: 'somi',
                size: '160px',
                strokeColor: '#364c781d',
                strokeWidth: '2px',
                fill: 'transparent',
                font: '"Sofia Sans", ui-sans-serif',
                weight: 700,
                tracking: '0em',
                opacity: 1,
                left: '0rem',
                top: '8rem',
                rotate: '0deg'
            },
            isActive: true
        };

        // Insert the data
        const results = new Results(defaultContent);
        await results.save();

        console.log('Results content seeded successfully!');
        console.log('Created content with ID:', results._id);
    } catch (error) {
        console.error('Error seeding Results content:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seeding function
seedResults();
