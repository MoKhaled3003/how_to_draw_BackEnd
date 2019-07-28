var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const mongouri = 
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports={mongoose};