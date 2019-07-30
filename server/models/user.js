const mongoose = require('mongoose');
const validator = require('validator');
const JWT = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    email :{
        type : String,
        required : true,
        trim : true,
        minlength : 1,
        uniqe : true,
        validate : {
            validator: validator.isEmail,
            message : '{VALUE} is not a valid email'
        }     
    },
    password : {
        type : String,
        minlength: 6,
        required : true 
    },
    tokens: [{
        access: {
            type : String,
            required : true
        },
        token: {
            type : String,
            required : true
        }
    }]
});

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = JWT.sign({_id: user._id.toHexString(),access},'abc123').toString();

    user.tokens.push({access,token});
    return user.save().then(()=>{
        return token;
    });
};


var User = mongoose.model('User',UserSchema);


module.exports = {User};