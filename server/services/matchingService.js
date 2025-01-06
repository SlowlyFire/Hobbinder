const tf = require('@tensorflow/tfjs-node');
const User = require('../models/users');
const Event = require('../models/Event');
const calculateDistance = require('../utils/distanceCalculator');

class MatchingService {
    constructor() {
        this.model = null;
        this.loadModel();
    }
    
    async loadModel() {
        try {
            console.log('\n=== Initializing Matching Model ===');
            console.log('Current directory:', process.cwd());
            console.log('Attempting to load model from:', 'file://./ml/trained-model/model.json');
            
            this.model = await tf.loadLayersModel('file://./ml/trained-model/model.json');
            console.log('✓ Model loaded successfully');
            
            // Test the model
            const sampleFeatures = tf.tensor2d([[
                0.5, 1, 0.4, 0.7, 0.8
            ]]);
            
            const prediction = this.model.predict(sampleFeatures);
            const score = prediction.dataSync()[0];
            
            console.log('\nModel Validation Test:');
            console.log('Input features:');
            console.log('- Distance: 5km (normalized: 0.5)');
            console.log('- Category: Match');
            console.log('- Platform time: 2 years (normalized: 0.4)');
            console.log('- Like ratio similarity: 70%');
            console.log('- Age similarity: 80%');
            console.log(`Result: ${(score * 100).toFixed(1)}% match\n`);
            
            sampleFeatures.dispose();
            prediction.dispose();
        } catch (error) {
            console.error('❌ Error loading matching model:');
            console.error('Error details:', error);
            console.error('Current working directory:', process.cwd());
            console.error('Attempted model path:', 'file://./ml/trained-model/model.json');
            console.error('Does model.json exist?', require('fs').existsSync('./ml/trained-model/model.json'));
            console.error('Does weights.bin exist?', require('fs').existsSync('./ml/trained-model/weights.bin'));
            
            // Instead of throwing, initialize a fallback model
            console.log('\nInitializing fallback model...');
            this.model = tf.sequential({
                layers: [
                    tf.layers.dense({
                        inputShape: [5],
                        units: 8,
                        activation: 'relu'
                    }),
                    tf.layers.dense({
                        units: 4,
                        activation: 'relu'
                    }),
                    tf.layers.dense({
                        units: 1,
                        activation: 'sigmoid'
                    })
                ]
            });
    
            this.model.compile({
                optimizer: tf.train.adam(0.001),
                loss: 'binaryCrossentropy',
                metrics: ['accuracy']
            });
    
            console.log('✓ Fallback model initialized');
        }
    }

    async predictMatch(user, event, eventCreator) {
        console.log('\n=== Starting Prediction Process ===');
        console.log(`Event: ${event.category} by ${event.uploader.username}`);
        console.log(`Location: ${event.location.name}`);
        
        try {
            // Calculate and log features
            console.log('\nCalculating features...');
            const features = this.calculateFeatures(user, event, eventCreator);
            
            console.log('\nFeature Values:');
            console.log('- Distance:', features.distance.toFixed(2), 'km (normalized)');
            console.log('- Category Match:', features.categoryMatch ? 'Yes (1.0)' : 'No (0.0)');
            console.log('- User Platform Time:', features.userExistingTime.toFixed(2), '(normalized years)');
            console.log('- Like Ratio Similarity:', features.likeRatioSimilarity.toFixed(2));
            console.log('- Age Similarity:', features.ageSimilarity.toFixed(2));

            // Validate features
            if (!this.validateFeatures(features)) {
                console.error('\n❌ Feature validation failed');
                console.error('Invalid or missing features:', features);
                throw new Error('Invalid or missing features for prediction');
            }
            console.log('\n✓ Features validated successfully');

            const score = await tf.tidy(() => {
                console.log('\nCreating input tensor...');
                const inputTensor = tf.tensor2d([[
                    features.distance,
                    features.categoryMatch,
                    features.userExistingTime,
                    features.likeRatioSimilarity,
                    features.ageSimilarity
                ]]);
                
                console.log('Running prediction...');
                const prediction = this.model.predict(inputTensor);
                const score = prediction.dataSync()[0];
                
                console.log(`\n✓ Prediction complete: ${(score * 100).toFixed(1)}% match`);
                return score;
            });

            return score;

        } catch (error) {
            console.error('\n❌ Error in prediction process:');
            console.error('Error details:', error.message);
            console.error('User:', user.username);
            console.error('Event:', event.id);
            throw error;
        }
    }

    validateFeatures(features) {
        const requiredFeatures = [
            'distance',
            'categoryMatch',
            'userExistingTime',
            'likeRatioSimilarity',
            'ageSimilarity'
        ];

        console.log('\nValidating features...');
        const validationResults = requiredFeatures.map(feature => {
            const value = features[feature];
            const isValid = typeof value === 'number' && !isNaN(value) && isFinite(value);
            console.log(`- ${feature}: ${isValid ? '✓' : '❌'} (${value})`);
            return isValid;
        });

        return validationResults.every(result => result);
    }

    calculateFeatures(user, event, eventCreator) {
        console.log('\n=== Calculating Features ===');
        console.log('User:', user.username);
        console.log('Event:', event.category);
        console.log('Creator:', event.uploader.username);

        // Calculate distance
        const distance = calculateDistance(
            user.location?.coordinates || { latitude: 0, longitude: 0 },
            event.location?.coordinates || { latitude: 0, longitude: 0 }
        ) / 10;
        console.log('\nDistance calculation:');
        console.log('- Raw distance:', (distance * 10).toFixed(2), 'km');
        console.log('- Normalized distance:', distance.toFixed(2));

        // Check category match
        const categoryMatch = user.hobbies?.includes(event.category) ? 1 : 0;
        console.log('\nCategory match:');
        console.log('- User hobbies:', user.hobbies?.join(', '));
        console.log('- Event category:', event.category);
        console.log('- Match result:', categoryMatch ? 'Yes (1.0)' : 'No (0.0)');

        // Calculate platform time
        const userTimeMs = new Date() - new Date(user.createdAt || new Date());
        const userYears = userTimeMs / (1000 * 60 * 60 * 24 * 365);
        const userExistingTime = Math.min(userYears / 5, 1);
        console.log('\nPlatform time:');
        console.log('- Raw time:', userYears.toFixed(2), 'years');
        console.log('- Normalized time:', userExistingTime.toFixed(2));

        // Calculate like ratio similarity
        const userRatio = user.eventInteractions?.likeRatio || 0;
        const creatorRatio = eventCreator.eventInteractions?.likeRatio || 0;
        const likeRatioSimilarity = 1 - Math.abs(userRatio - creatorRatio);
        console.log('\nLike ratio similarity:');
        console.log('- User ratio:', userRatio.toFixed(2));
        console.log('- Creator ratio:', creatorRatio.toFixed(2));
        console.log('- Similarity score:', likeRatioSimilarity.toFixed(2));

        // Calculate age similarity
        const userAge = this.calculateAge(user.birthday);
        const creatorAge = this.calculateAge(eventCreator.birthday);
        const ageDiff = Math.abs(userAge - creatorAge);
        const ageSimilarity = Math.max(0, 1 - (ageDiff / 20));
        console.log('\nAge similarity:');
        console.log('- User age:', userAge);
        console.log('- Creator age:', creatorAge);
        console.log('- Age difference:', ageDiff);
        console.log('- Similarity score:', ageSimilarity.toFixed(2));

        return {
            distance,
            categoryMatch,
            userExistingTime,
            likeRatioSimilarity,
            ageSimilarity
        };
    }

  // Right now we actually don't call it
    async getMatchesForUser(username) {
        try {
            console.log('\n=== Starting Match Calculations for ${username} ===');
            
            const user = await User.findOne({ username });
            if (!user) {
                throw new Error('User not found');
            }
    
            const events = await Event.find({
                'uploader.username': { $ne: username },
                when_date: { $gt: new Date() }
            });
    
            console.log(`Found ${events.length} events to analyze`);
    
            const matches = [];
            for (const event of events) {
                const eventCreator = await User.findOne({ 
                    username: event.uploader.username 
                });
    
                if (!eventCreator) {
                    console.warn(`Creator not found for event ${event.id}, skipping...`);
                    continue;
                }
    
                // Calculate features first
                const features = this.calculateFeatures(user, event, eventCreator);
                console.log('\nCalculated features:', {
                    distance: features.distance,
                    categoryMatch: features.categoryMatch,
                    userExistingTime: features.userExistingTime,
                    likeRatioSimilarity: features.likeRatioSimilarity,
                    ageSimilarity: features.ageSimilarity
                });
    
                // Get prediction using calculated features
                const score = await this.predictMatch(features);
    
                matches.push({
                    eventId: event.id,
                    event,
                    score,
                    features
                });
            }
    
            const topMatches = matches
                .sort((a, b) => b.score - a.score)
                .slice(0, 30);
    
            return topMatches;
        } catch (error) {
            console.error('Error getting matches:', error);
            throw error;
        }
    }

    // Helper function to calculate age
    calculateAge(birthday) {
        const today = new Date();
        const birthDate = new Date(birthday);
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        const dayDifference = today.getDate() - birthDate.getDate();
      
        // Adjust if the birthday hasn't happened yet this year
        if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
          age--;
        }
      
        return age;
      }
}


module.exports = new MatchingService();