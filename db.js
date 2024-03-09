const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/inotes?authMechanism=DEFAULT";

const connectToMongo = async () => {
        await mongoose.connect(mongoURI);
        console.log("Database connected successfully");
};

module.exports = connectToMongo;

