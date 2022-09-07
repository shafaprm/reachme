const express = require('express');
const routes = express.Router();
const multer = require("multer")
const mongoose = require("mongoose")

const storage = require("../utils/cloudinary.js");
const upload = multer({storage})
const User = require('../models/User.js');
const Chat = require('../models/Chat.js')
const HttpError = require('../utils/http-error.js');
const isAuthenticated = require('../middlewares/isAuthenticated.js');  

routes.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if(!user){
            return res.json({message : 'User not found', status : false});
        }

        res.json({user, status : true, message : 'success' });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Internal server error', 500))
    } 
})

routes.get('/search-by-username/:username', isAuthenticated, async (req, res, next) => {
    try {
        const username = req.params.username
        const currentUser = await User.findById(req.user.id);
        if(username === currentUser.username){
            return res.json({message : 'User not found', status : false});
        }
        const user = await User.findOne({username : username});
        if(!user){
            return res.json({message : 'User not found', status : false});
        };

        let isFriend = false

        if(currentUser.friends.find((friend) => String(friend) === String(user._id))){
            isFriend = true
        }
        return res.json({message : 'User found', status : true, user : user, isFriend : isFriend});
    } catch (err) {
        console.log(err)
        return next(new HttpError('Internal server error', 500));        
    }
})

routes.post('/add-friend', isAuthenticated, async (req, res, next) => {
    try {
        const friendId = req.body.friendId;
        const userId = req.user.id;

        const friend = await User.findById(friendId);
        if(!friend){
            return res.json({message : 'User not found', status : false});
        }

        const user = await User.findById(userId);
        if(user.friends.find((friend) => String(friend) === String(friendId))){
            return res.json({message : "User is already your friend", status : false});
        }

        await User.findByIdAndUpdate(userId, {
            $push : {'friends' : friendId}
        })

        friend.friends.push(userId);
        await friend.save()

        return res.json({message : 'User added', status : true});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Internal server error', 404));        
    }
})

routes.post("/add-chat", isAuthenticated, async (req, res, next) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.id;
        const friend = await User.findById(friendId);

        const findChat = await Chat.findOne({user : userId})
        if(!findChat){
            const newChat = new Chat({
                user : userId,
                chats : [
                    {
                        friend : friendId,
                        lastMessage : 'Start a new message!',
                    }
                ]
            })
            await newChat.save();
            return res.json({message : 'Start chat', status : true, isAdded : false, user : friend});
        }
        else if(findChat && !findChat.chats.find((chat) => String(chat.friend) === String(friendId))){
            await Chat.findByIdAndUpdate(findChat._id, {
                $push : {
                    'chats' : {
                        friend : friendId,
                        lastMessage : 'Start a new message',
                    },
                }
            }, { upsert : true })

            return res.json({message : 'Start chat', status : true, isAdded : false, user: friend})
        }
        else if(findChat && findChat.chats.find((chat) => String(chat.friend) === String(friendId))){
            return res.json({message : 'already exist', status : true, isAdded : true});
        }
    } catch (err) {
        console.log(err);
        return next(new HttpError('Internal server error', 400));        
    }
})

routes.get("/chats/:userId", isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const chat = await Chat.findOne({user : userId}).populate('chats.friend');

        //CONVERTING TIME
        // console.log(new Date(chat.updatedAt).toLocaleTimeString([], {timeStyle : 'short', hour12 : false}));

        if(!chat){
            return res.json({message : 'Chat not found', status : true, chat : null});
        }

        return res.json({message : 'Chat found', chat : chat, status : true });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Internal server error', 400));        
    }
})

routes.get("/find-friend/:friendUsername", isAuthenticated, async (req, res, next) => {
    try {
        const {friendUsername} = req.params;
        if(friendUsername === ''){
            return res.json({status : true})
        }
        const findFriend = await User.findOne({username : friendUsername});
        if(!findFriend){
            return res.json({message : 'User not found', status : false});
        }
        const user = await User.findById(req.user.id);
        
        if(!user.friends.find((friend) => String(friend) === String(findFriend._id))){
            return res.json({message : `${friendUsername} is not your friend`, status : false});
        }

        return res.json({message : 'Friend found', status : true, user : findFriend});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Internal server error', 400));        
    }
})

routes.post("/set-profile/:userId", isAuthenticated, upload.single("avatar"), async (req, res, next) => {
    try {   
        const { username, email, bio } = req.body;
        const image = req.file;
        const user = await User.findByIdAndUpdate(req.user.id, {
            username,
            email,
            bio,
            avatar : {
                url : image.path,
                filename : image.filename
            }
        });

        await user.save();
        res.json({message : 'Success', user : user, status : true});
    } catch (err) {
        console.log(err);
        return next(new HttpError("Internal server error", 500));        
    }
})

module.exports = routes;