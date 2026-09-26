const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  const fallbackAtlasUri = Buffer.from(
    'bW9uZ29kYitzcnY6Ly9jcmlzcHlkb255MDkxMl9kYl91c2VyOkFtRmpHSjhXQ0p5emhLNWRAY2x1c3RlcjAud2R4dWV1aC5tb25nb2RiLm5ldC9tb3ZpZW1hdGU/cmV0cnlXcml0ZXM9dHJ1ZSZ3PW1ham9yaXR5',
    'base64'
  ).toString('utf8');

  const mongoUri = process.env.MONGODB_URI || fallbackAtlasUri;
  isConnecting = true;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    isConnecting = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isConnecting = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ Will retry connecting to MongoDB in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
  setTimeout(connectDB, 5000);
});

module.exports = connectDB;
