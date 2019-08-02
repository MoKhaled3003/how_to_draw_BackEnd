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
app.post('/todos',authenticate,(req,res)=>{
    var todo = new Todo({
        text : req.body.text,
        _creator : req.user._id
    });
    todo.save().then((doc)=>{
        res.send(doc);
    },(err)=>{
        res.status(400).send(err);
    });
});

app.get('/todos',authenticate,(req,res)=>{
    Todo.find({
        _creator : req.user._id
    }).then((todos)=>{
        res.send({todos});
    },(er)=>{
        res.status(400).send(er);
    });
});
app.get('/todos/:id',authenticate,(req,res)=>{
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findOne({
        _id : id,
        _creator : req.user._id
    }).then((todo)=>{
        if(!todo){
           return res.status(404).send();
        }
        res.send(JSON.stringify(todo,undefined,2));
    }).catch((err)=>{
         res.status(400).send();
    });
});
app.delete('/todos/:id',authenticate,(req,res)=>{
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((result)=>{
        if(!result){
            return res.status(404).send();
        }
        res.send(JSON.stringify(result),undefined,2);
    }).catch((err)=>{
        res.status(400).send();
    });
});
app.patch('/todos/:id',authenticate,(req,res)=>{
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    var body = _.pick(req.body,["text","completed"]);
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    }else{
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findOneAndUpdate({_id: id,_creator: req.user._id},{$set:body},{new:true}).then((result)=>{
        if(!result){
            return res.status(404).send();
        }
        res.send({result});
    }).catch((er)=>{
        return res.status(400).send();
    });
});
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




 