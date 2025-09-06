import { connectDB } from '../lib/mongodb.js';
import FAQ from '../lib/model/faq.js';

const seedFAQData = async () => {
  try {
    await connectDB();
    
    // Clear existing FAQ data
    await FAQ.deleteMany({});
    
    // Create default FAQ data
    const faqData = new FAQ({
      heading: "Find clear, honest answers about our medical weight loss treatments",
      subheading: "Your Questions, Answered— Every Step of the Way.",
      faqs: [
        {
          question: "How do I get started with Somi Health's weight loss program?",
          answer: "You can begin by completing a quick 7-minute questionnaire, which gathers important information about your medical history, health status, and weight loss goals.",
          sortOrder: 0
        },
        {
          question: "What happens after I submit the questionnaire?",
          answer: "Once you complete the form, our licensed Nurse Practitioner will review your information to determine your eligibility for GLP-1 or GIP/GLP-1 treatment.",
          sortOrder: 1
        },
        {
          question: "How long does it take to receive my medication?",
          answer: "After approval, your prescription is sent to the pharmacy, and you will receive your medication within 2–5 days, along with complete usage instructions.",
          sortOrder: 2
        },
        {
          question: "Are the medications safe and effective?",
          answer: "Yes, the medications we use, including Compounded Semaglutide and Compounded Tirzepatide, are clinically proven to be safe and effective when prescribed and monitored by a healthcare provider.",
          sortOrder: 3
        },
        {
          question: "What are the benefits of using Somi Health's medical weight loss services?",
          answer: "We provide regular health monitoring, personalized treatment plans, reduced risk of side effects, and continuous support from our healthcare team throughout your journey.",
          sortOrder: 4
        },
        {
          question: "How much weight can I expect to lose with Compounded Tirzepatide?",
          answer: "Studies show that patients using Compounded Tirzepatide can expect a weight loss of approximately 20%–30% of their starting body weight with consistent use and proper medical supervision.",
          sortOrder: 5
        }
      ],
      benefits: [
        { text: "Trusted clinical guidance", sortOrder: 0 },
        { text: "Transparent process & pricing", sortOrder: 1 },
        { text: "Fast 2–5 day delivery after approval", sortOrder: 2 }
      ],
      footerTitle: "Still have questions?",
      footerDescription: "Cant find the answer youre looking for? Please chat to our friendly team.",
      footerButtonText: "Get in touch",
      footerButtonLink: "/underdevelopmentmainpage/contact",
      isActive: true
    });
    
    await faqData.save();
    console.log('FAQ data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding FAQ data:', error);
  } finally {
    process.exit(0);
  }
};

seedFAQData();
