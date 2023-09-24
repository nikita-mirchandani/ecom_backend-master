var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");

// bcrypt(for encrypt password) jsonwebtoken pg cors 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var api = require('./routes/api');
var jwtauth = require('./routes/jwtAuth');
var dashboard = require('./routes/dashboard')
var sellerdashboard = require('./routes/sellerdashboard')
var app = express();

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', api);
app.use('/auth', jwtauth);
app.use('/dashboard',dashboard);
app.use('/sellerdashboard',sellerdashboard);
app.listen(5000,()=>{
    console.log('Server is listening on port 5000');
})
module.exports = app;
