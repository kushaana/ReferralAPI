const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [emailRegex, 'Please enter a valid email']
    },
    password: {
        type: String,
    },
    referralCode: String,
    refereeCode: String,
    referredUsers: [String]
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",UserSchema);
module.exports = User;