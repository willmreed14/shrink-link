const mongoose = require('mongoose') // require mongoose again

// Create a schema
// Takes an object: all diff. columns for the DB
const shortUrlSchema = new mongoose.Schema({
    full: { // name of column
        type: String, // type of column
        require: true // is column required?
    }

    short: { 
        type: String,
        require: true
    }
})