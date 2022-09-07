const mongoose = require("mongoose")
const { Schema } = mongoose;

const ChatSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    chats : [
        {
            friend : {
                type : Schema.Types.ObjectId,
                ref : 'User'
            },
            lastMessage : {
                type : String,
            },
        }
    ]
}, {timestamps : true})

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;