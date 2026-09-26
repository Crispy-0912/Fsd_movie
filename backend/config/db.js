const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moviemate';
  isConnecting = true;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
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
