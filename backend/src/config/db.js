const mongoose = require('mongoose');

async function connectDB() {
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME;
  if (!mongoUrl || !dbName) {
    throw new Error('MONGO_URL or DB_NAME missing in env');
  }
  await mongoose.connect(mongoUrl, { dbName });
  console.log(`Mongo connected: db=${dbName}`);
}

module.exports = connectDB;
