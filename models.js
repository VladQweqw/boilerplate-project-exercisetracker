const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
    }
})

const exerciseSchema = new Schema({
    username: {
        type: Schema.Types.ObjectId, 
        ref: "User"
    },
    description: {
        type: String,
    },
    duration: {
        type: Number
    },
    date: {
        type: String,
    }
})

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);
module.exports = {
    User, 
    Exercise
};