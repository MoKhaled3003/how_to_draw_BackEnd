const express = require('express');
const bodyParser = require('body-parser');


var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Todo} = require('./models/todo');

var app = express();
app.use(bodyParser.json());
app.post('',(req,res)=>{
    console.log(req.body);
});




app.listen(3000,()=>{
    console.log('the server is on at 3000');
});




