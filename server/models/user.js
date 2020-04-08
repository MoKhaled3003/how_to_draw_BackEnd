const mongoose = require('mongoose');
const validator = require('validator');
const JWT = require('jsonwebtoken');
const _ = require('lodash');
const bcryptjs = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    name :{
        type : String,
        trim : true
    },
    user_name :{
        type : String,
        required : true,
        trim : true,
        minlength : 1,
        uniqe : true
    },
    gender :{
        type : String
        },
    birthday :{
        type : String
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


UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject,['_id','user_name']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = JWT.sign({_id: user._id.toHexString(),access},'abc123').toString();

    user.tokens.push({access,token});
    return user.save().then(()=>{
        return token;
    });
};

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;
    try{
         decoded = JWT.verify(token , 'abc123');
    } catch (e){
        return Promise.reject();
    }

   return User.findOne({
        '_id' : decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.pre('save',function (next) {
    var user = this;
    if(user.isModified('password')){
        bcryptjs.genSalt(10,(err,salt)=>{
            bcryptjs.hash(user.password,salt,(err,hashedPassword)=>{
                user.password = hashedPassword;
                next();
            });
        });
    } else {
        next();
    }
    
});

UserSchema.statics.findByCredentials = function (user_name,password) {
    var User = this;
    
    return User.findOne({user_name}).then((user)=>{
        if(!user){
            return new Promise.reject();
        }
        return new Promise((resolve,reject)=>{
            bcryptjs.compare(password,user.password,(err,res)=>{
                if(res){
                    resolve(user);
                }else{
                    reject();
                }
            });
        });
        
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({
        $pull : {
            tokens : {token}
        }
        
    });
};




var User = mongoose.model('User',UserSchema);


module.exports = {User};