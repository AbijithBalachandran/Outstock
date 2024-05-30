const mongoose =require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/user_storing_system');
const session = require('express-session');
const { sessionSecret } = require('./Config/config');
require('dotenv').config();


const express = require('express');
const app = express();
const path = require('path');

app.use(session({
      secret:sessionSecret,
      resave:false,
      saveUninitialized:false
}));

app.use(express.static('public'))
app.use('/css',express.static(path.join(__dirname,'public/css')))
app.use('/lib',express.static(path.join(__dirname,'public/lib')))


const nocache = require("nocache");
app.use(nocache());


const adminRouter = require('./routes/adminRouter');
app.use('/admin',adminRouter);

const userRouter = require('./routes/userRouter');


app.use('/',userRouter);
 

app.listen(3000,()=>{
      console.log('http://localhost:3000');
});