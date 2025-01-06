// This script trains our model and saves it for later use
const tf = require('@tensorflow/tfjs-node');
const { generateTrainingData } = require('./trainingDataGenerator');

async function trainModel() {
    console.log('Starting model training...');

    // Generate 1000 training examples
    console.log('Generating training data...');
    const trainingData = generateTrainingData(1000);

    // Log some statistics about our generated data
    const matches = trainingData.filter(d => d.match === 1).length;
    console.log(`Generated ${trainingData.length} examples:`);
    console.log(`Positive matches: ${matches} (${(matches / trainingData.length * 100).toFixed(1)}%)`);
    console.log(`Negative matches: ${trainingData.length - matches} (${((trainingData.length - matches) / trainingData.length * 100).toFixed(1)}%)`);

    // Prepare data for training
    console.log('\nPreparing data for training...');
    const features = trainingData.map(d => [
        d.features.distance,
        d.features.categoryMatch,
        d.features.userExistingTime,
        d.features.likeRatioSimilarity,
        d.features.ageSimilarity
    ]);
    const labels = trainingData.map(d => [d.match]);

    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    // Create our neural network
    console.log('Creating neural network...');
    const model = tf.sequential({
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

    // Configure training settings
    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    // Train the model
    console.log('\nStarting training...');
    await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(
                    `Epoch ${epoch + 1}: ` +
                    `accuracy = ${(logs.acc * 100).toFixed(1)}%`
                );
            }
        }
    });

    // Test the model with some example cases
    console.log('\nTesting model with example cases:');
    const testCases = [
        {
            description: "Perfect match",
            features: [0, 1, 1, 1, 1]  // Close, matching category, experienced user, similar patterns & ages
        },
        {
            description: "Terrible match",
            features: [1, 0, 0, 0, 0]  // Far, no match, new user, different patterns & ages
        },
        {
            description: "Mixed case",
            features: [0.5, 1, 0.5, 0.5, 0.5]  // Average values
        }
    ];

    for (const testCase of testCases) {
        const prediction = model.predict(tf.tensor2d([testCase.features]));
        const score = prediction.dataSync()[0];
        console.log(`\n${testCase.description}:`);
        console.log(`Features: ${testCase.features.join(', ')}`);
        console.log(`Predicted match score: ${(score * 100).toFixed(1)}%`);
    }

    // Save the trained model
    console.log('\nSaving model...');
    await model.save('file://./trained-model');
    console.log('\nTraining complete! Model saved to ./trained-model');


    // Clean up
    xs.dispose();
    ys.dispose();
}

trainModel().catch(console.error);