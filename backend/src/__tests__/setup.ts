import mongoose from 'mongoose';

let app: any;

/**
 * Start a MongoDB in-memory server for all tests.
 * This file is imported by jest before each test suite.
 */
export const initTestDB = async () => {
  // Use a short-lived in-memory MongoDB for testing
  const mongoUri = process.env.MONGO_URI_TEST_REPLACE || 'mongodb://localhost:27017/meeting-app-test';
  await mongoose.connect(mongoUri);
};

/**
 * Close the DB connection after each test suite.
 */
export const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};
