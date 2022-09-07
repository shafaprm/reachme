const jwt = require('jsonwebtoken');
require('dotenv').config();

const HttpError = require('../utils/http-error.js')
const SECRET = process.env.JWT_SECRET;

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        
        if(!token){
            return next(new HttpError('token must be provided', 400));
        };

        const decoded = await jwt.verify(token, SECRET);
        req.user = {id : decoded.id, email : decoded.email, username : decoded.username}

        return next()
    } catch (err) {
        console.log(err)        
    }
}

module.exports = isAuthenticated;