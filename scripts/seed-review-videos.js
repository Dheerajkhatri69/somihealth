const mongoose = require('mongoose');
const ReviewVideo = require('../lib/model/reviewVideo.js').default;
const { connectionSrt } = require('../lib/db.js');

async function seedReviewVideos() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionSrt);
    console.log('Connected to MongoDB');

    // Clear existing videos
    await ReviewVideo.deleteMany({});
    console.log('Cleared existing review videos');

    // Create default review videos
    const defaultVideos = [
      {
        title: "Down 18% in 4 months",
        subtitle: "Semaglutide · Ayesha",
        description: "I finally stopped yo-yo dieting. The check-ins kept me on track and the shipping was seamless.",
        poster: "/hero/v1.png",
        srcMp4: "/hero/1.mov",
        isActive: true,
        sortOrder: 0
      },
      {
        title: "More energy, less stress",
        subtitle: "Tirzepatide · David",
        description: "Super simple. The plan fit my routine and I didn't feel alone in the process.",
        poster: "/hero/v2.png",
        srcMp4: "/hero/2.mp4",
        isActive: true,
        sortOrder: 1
      },
      {
        title: "Real results that last",
        subtitle: "Semaglutide · Sara",
        description: "Weekly nudges and clear guidance—no guesswork. I'm the most consistent I've ever been.",
        poster: "/hero/v3.png",
        srcMp4: "/hero/3.mp4",
        isActive: true,
        sortOrder: 2
      },
      {
        title: "Confidence is back",
        subtitle: "Tirzepatide · Hamza",
        description: "The plan was realistic. I followed it, the weight came off, and I feel great.",
        poster: "/hero/v4.png",
        srcMp4: "/hero/4.mov",
        isActive: true,
        sortOrder: 3
      }
    ];

    for (const videoData of defaultVideos) {
      const video = new ReviewVideo(videoData);
      await video.save();
      console.log('Created video:', video.title);
    }

    console.log('Review videos seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding review videos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedReviewVideos();
