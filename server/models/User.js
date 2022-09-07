const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    bio : {
        type : String,
        default : ''
    },
    avatar : {
        url : {
            type : String,
        },
        filename : {
            type : String
        },
    },
    friends : [{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }],
})

const User = mongoose.model('User', userSchema);
module.exports = User;