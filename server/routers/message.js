const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');

const Message = require("../models/Message.js");
const User = require("../models/User.js");
const HttpError = require('../utils/http-error.js');
const isAuthenticated = require("../middlewares/isAuthenticated.js");

routes.post("/send-message", isAuthenticated, async (req, res, next) => {
    try {
        const {receiver, sentMessage} = req.body;
        const sender = req.user.id;

        const message = new Message({
            message : sentMessage, 
            users : [receiver, sender],
            sender : sender, 
        });

        console.log(message)

        await message.save();
        return res.json({message : 'Message sent and save', status : true});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Internal server error', 400))        
    }
})

routes.get('/get-message/:user2', isAuthenticated, async (req, res, next) => {
    try {
        const user2 = req.params.user2;
        const user1 = req.user.id;
        const user = await User.findById(user2);
        const messages = await Message.find({users : {$all : [user1, user2]}}).sort({updatedAt : 1}).limit(20);

        if(messages.length === 0 || !messages){
            return res.json({message : 'No messages found', status : false, messages : []})
        }

        return res.json({message : 'messages find', messages : messages, status : true})
    } catch (err) {
        console.log(err);
        return next(new HttpError('Internal server error', 400));        
    }
})

module.exports = routes;