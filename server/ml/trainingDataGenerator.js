// This file helps us create realistic training data for our model
const tf = require('@tensorflow/tfjs-node');

const generateTrainingData = (numberOfExamples) => {
    // Helper to generate random numbers in a range
    const randomInRange = (min, max) => min + Math.random() * (max - min);

    const trainingData = [];
    
    for (let i = 0; i < numberOfExamples; i++) {
        // Generate realistic values for each feature
        const distance = randomInRange(0, 10);         // 0-10 km
        const categoryMatch = Math.random() > 0.5;     // true/false
        const userExistingTime = randomInRange(0, 5);  // 0-5 years on platform
        const likeRatioSimilarity = randomInRange(0, 1); // How similar are their like patterns
        const ageSimilarity = randomInRange(0, 1);     // How close are they in age

        // Calculate a realistic match probability based on these features
        let matchProbability = 
            (1 - distance/10) * 0.3 +      // Distance is 30% important
            (categoryMatch ? 0.3 : 0) +    // Category match is 30% important
            (userExistingTime/5) * 0.1 +   // Experience on platform is 10% important
            likeRatioSimilarity * 0.15 +   // Similar behavior patterns is 15% important
            ageSimilarity * 0.15;          // Age similarity is 15% important

        // Add some randomness to make it more realistic
        matchProbability = Math.min(1, Math.max(0, 
            matchProbability + randomInRange(-0.1, 0.1)
        ));

        // Create the training example
        trainingData.push({
            features: {
                distance: distance / 10,  // Normalize to 0-1
                categoryMatch: categoryMatch ? 1 : 0,
                userExistingTime: userExistingTime / 5,
                likeRatioSimilarity,
                ageSimilarity
            },
            match: Math.random() < matchProbability ? 1 : 0  // Convert probability to binary outcome
        });
    }

    return trainingData;
};

module.exports = { generateTrainingData };