const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
    message : {
        type : String,
    },
    users : [{type : Schema.Types.ObjectId, ref : 'User'}],
    sender : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },

}, { timestamps : true });

const Message = mongoose.model('Message', MessageSchema)
module.exports = Message;