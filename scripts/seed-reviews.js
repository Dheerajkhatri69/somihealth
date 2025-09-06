const mongoose = require('mongoose');
const Review = require('../lib/model/review.js').default;
const { connectionSrt } = require('../lib/db.js');

async function seedReviews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionSrt);
    console.log('Connected to MongoDB');

    // Clear existing reviews
    await Review.deleteMany({});
    console.log('Cleared existing reviews');

    // Create default reviews
    const defaultReviews = [
      {
        quote: "I wasn't ready for injections and honestly didn't think oral semaglutide would do much, but I've been really surprised. Lost about 8 lbs in a month and I just… forget to snack.",
        author: "Amanda W.",
        isActive: true,
        sortOrder: 0
      },
      {
        quote: "My provider adjusted the plan twice and it kept working. Shipping was fast and support replied within a day. The app reminders helped me stay consistent even on busy weeks.",
        author: "Rahul S.",
        isActive: true,
        sortOrder: 1
      },
      {
        quote: "Checked in every month and stayed consistent. I have more energy than I did last year, and the nutrition tips actually fit my life—no weird rules or all-or-nothing thinking.",
        author: "Sofia M.",
        isActive: true,
        sortOrder: 2
      }
    ];

    for (const reviewData of defaultReviews) {
      const review = new Review(reviewData);
      await review.save();
      console.log('Created review:', review.author);
    }

    console.log('Reviews seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding reviews:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedReviews();
