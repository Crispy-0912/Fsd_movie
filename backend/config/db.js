const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moviemate';
    const conn = await mongoose.connect(mongoUri, {
      // Mongoose v6+ defaults are optimal
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ Server will stay running while waiting for database connection.');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

module.exports = connectDB;
