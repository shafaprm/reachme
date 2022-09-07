const mongoose = require('mongoose');

const HttpError = require('./http-error.js');

const connectMongo = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/reachme", {
            useNewUrlParser : true,
            useUnifiedTopology : true,
        });

        console.log('Database connection SUCCESS')
    } catch (err) {
        console.log(err)
        console.log('Database connection FAILED');
    }
}

module.exports = connectMongo;