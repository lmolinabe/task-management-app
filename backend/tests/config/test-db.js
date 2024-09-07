// test-db.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

// Connect to the in-memory database
module.exports.connect = async () => {
  await mongod.start();
  const uri = await mongod.getUri('test_task_management_db');
  await mongoose.connect(uri, {});
};

// Disconnect and close the in-memory database
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

// Clear the database after each test
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};