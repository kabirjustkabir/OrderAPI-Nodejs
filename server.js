const express = require('express');
const mongoose = require('mongoose');
const CustomError = require('./utils/CustomError');
const GlobalErrorHandler = require('./controllers/errorController')
require('./db/connection')
const routes = require('./routes/v1');

const app = express();

// parse json request body
app.use(express.json());

// v1 api routes
app.use('/v1', routes);

app.all('*',(req,res,next)=>{
    const err = new CustomError(`cannot find ${req.originalUrl} in the server`,404)
    next(err)
})
app.use(GlobalErrorHandler)

module.exports = app

// Please refer README.md file for description of my solution
