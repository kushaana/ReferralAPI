// require packages
const express = require('express');
const dotenv = require('dotenv');
const router = require('./router/routes');
const passport = require('passport');
const bodyParser = require("body-parser");
let path = require('path');

// import env variables
dotenv.config({path: './config.env'});

// connect to database
require('./db/dbconn');

// initialize app
const app = express();

//set view engine as ejs
app.set('views', path.join(__dirname, "views"));
app.set("view engine","ejs");

app.use(express.json());
app.use(require("express-session")({
    secret:"Refer to doc",
        resave: false,          
        saveUninitialized:false    
    })
);
app.use(bodyParser.urlencoded(
    { extended:true }
));

app.use(passport.initialize());
app.use(passport.session());
app.use(router);

// start server
const port = process.env.PORT || 3000;
app.listen(port, (err) => {
    if(err) console.log(err);
    else console.log("Server running on port", port);
})