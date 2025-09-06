import { connectDB } from '../lib/mongodb.js';
import Footer from '../lib/model/footer.js';

const seedFooterData = async () => {
  try {
    await connectDB();
    
    // Clear existing footer data
    await Footer.deleteMany({});
    
    // Create default footer data
    const footerData = new Footer({
      ctaTitle: 'Start your health journey now',
      ctaDescription: 'Somi Health offers personalized, clinically guided weight loss solutions to help you achieve lasting results and feel your best.',
      ctaBenefits: [
        { text: 'Somi Health offers personalized, clinically guided weight loss', sortOrder: 0 },
        { text: 'weight loss solutions to help you achieve lasting results and feel your best.', sortOrder: 1 },
        { text: 'Find a plan personalized for your goals', sortOrder: 2 }
      ],
      ctaLearnMoreText: 'Learn More',
      ctaLearnMoreLink: '/learn-more',
      ctaStartJourneyText: 'Start Your Journey',
      ctaStartJourneyLink: '/getstarted',
      ctaImage: '/hero/footer.png',
      brandName: 'somi',
      brandTagline: 'Look Better, Feel Better, Live Better.',
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com', ariaLabel: 'Instagram' },
        { platform: 'facebook', url: 'https://facebook.com', ariaLabel: 'Facebook' },
        { platform: 'tiktok', url: 'https://tiktok.com', ariaLabel: 'TikTok' },
        { platform: 'indeed', url: 'https://indeed.com', ariaLabel: 'Indeed' }
      ],
      contactInfo: {
        phone: '(704) 386-6871',
        address: '4111 E. Rose Lake Dr. Charlotte, NC 28217',
        email: 'info@joinsomi.com'
      },
      badges: [
        { name: 'LegitScript', image: '/hero/legitscript-badge.png', alt: 'LegitScript Certified', sortOrder: 0 },
        { name: 'HIPAA', image: '/hero/hipaa-badge.png', alt: 'HIPAA Certified', sortOrder: 1 }
      ],
      navigationLinks: [
        { text: 'Referrals', href: '/referrals', target: '_self', rel: '', sortOrder: 0 },
        { text: 'Patient GLP-1 Packet', href: '/docs/patient-glp1-packet.pdf', target: '_blank', rel: 'noopener noreferrer', sortOrder: 1 },
        { text: 'About Us', href: '/underdevelopmentmainpage/about', target: '_self', rel: '', sortOrder: 2 },
        { text: 'Contact Us', href: '/underdevelopmentmainpage/contact', target: '_self', rel: '', sortOrder: 3 }
      ],
      legalLinks: [
        { text: 'HIPAA Privacy', href: '/underdevelopmentmainpage/footer/hipaa', sortOrder: 0 },
        { text: 'Terms of Service', href: '/underdevelopmentmainpage/footer/terms', sortOrder: 1 },
        { text: 'Shipping & Returns', href: '/underdevelopmentmainpage/footer/shipping-returns', sortOrder: 2 },
        { text: 'Telehealth Consent', href: '/underdevelopmentmainpage/footer/telehealth-consent', sortOrder: 3 },
        { text: 'Cookie Policy', href: '/underdevelopmentmainpage/footer/cookies', sortOrder: 4 }
      ],
      isActive: true
    });
    
    await footerData.save();
    console.log('Footer data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding footer data:', error);
  } finally {
    process.exit(0);
  }
};

seedFooterData();
