const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Todo} = require('./models/todo');
var {authenticate} = require('./../middleware/authenticate');

var app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/users',(req,res)=>{
    var body = _.pick(req.body,["email","password"]);
    var user = new User(body);
    user.save().then((user)=>{
       return user.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth',token).send(user);
    })
    .catch((er)=>{
        res.status(400).send(er);
    });

});


app.get('/users/me',authenticate,(req,res)=>{
    res.send(req.user);
});


app.post('/users/login',(req,res)=>{
    var body = _.pick(req.body,['email','password']);

    User.findByCredentials(body.email,body.password).then((user)=>{
            res.send(user);
    }).catch((er)=>{
        res.status(400).send(er);
    });
});

app.delete('/users/me/token',authenticate,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },(er)=>{
        res.status(401).send(er);
    });
});

app.listen(port,()=>{
    console.log(`the server is on at port ${port}`);
});




 