const Joi = require("joi");

const HttpError = require("../utils/http-error.js");

const signupSchema =  Joi.object({
    username : Joi.string().required(), 
    password : Joi.string().min(6).required(),
    email : Joi.string().required(),
})

const signupValidation = (req, res, next) => {
    const { error } = signupSchema.validate(req.body);
    if(error){
        const messages = error.details.map((err) => err.message).join(",");
        return next(new HttpError(messages, 400));
    }
    return next()
}

const signinSchema =  Joi.object({
    email : Joi.string().required(),
    password : Joi.string().min(6).required(),
});

const signinValidation = (req, res, next) => {
    const { error } = signinSchema.validate(req.body);
    if(error){
        const messages = error.details.map((err) => err.message).join(",");
        return next(new HttpError(messages, 400));
    }
    return next()
}

module.exports = { signinValidation, signupValidation}