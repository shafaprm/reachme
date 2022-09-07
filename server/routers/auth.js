const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

if(process.env.NODE_ENV !== 'production'){
    require("dotenv").config()
}

const {signinValidation, signupValidation} = require("../validation/user-validation.js");
const User = require('../models/User.js');
const HttpError = require("../utils/http-error.js");
const SECRET = process.env.JWT_SECRET;

router.post('/sign-up', signupValidation, async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const findUserByEmail = await User.findOne({email});
        const findUserByUsername = await User.findOne({username});
        
        if(findUserByUsername){
            res.json({message : "Username is already registered", status : false});
        }
        if(findUserByEmail){
            res.json({message : "Email is already registered", status : false})
        }
     
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password : hashedPassword,
            avatar : {
                url : 'https://res.cloudinary.com/dma5fdg3c/image/upload/v1661523184/reachme-profiles/zeowfqqspbmldkk5rxtt.png',
                pathname : 'zeowfqqspbmldkk5rxtt'
            }
        });

        await user.save()
        
        res.json({message : 'you are registered', user : user, status : true})
    } catch (err) {
        console.log(err)
        return next(new HttpError('Internal server error', 500))        
    }
})

router.post('/sign-in', signinValidation, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({email});

        if(!findUser){
            return res.json({message : 'You are not registerd', status : false});
        }

        const matchPassword = await bcrypt.compare(password, findUser.password);

        if(!matchPassword){
            return res.json({message : 'Password is invalid', status : false}); 
        };

        const payload = {
            id : findUser._id,
            email : findUser.email,
            username : findUser.username
        };

        const token = await jwt.sign(payload, SECRET, { expiresIn : '24h'})

        res.json({message : 'you are logged in', user : findUser, status : true, token : token})
    } catch (err) {
        console.log(err);
        return next(new HttpError('Internal server error', 500));        
    }
})

module.exports = router