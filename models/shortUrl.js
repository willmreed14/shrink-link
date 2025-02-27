// shortUrl.js

const mongoose = require('mongoose') // require mongoose again
const shortId = require('shortid') // require shortid

// Generate a shortid using shortid package
shortId.generate()

// Create a schema
// Takes an object: all diff. columns for the DB
const shortUrlSchema = new mongoose.Schema({
    full: { // name of column
        type: String, // type of column
        required: true // is column required?
    },
    short: {
        type: String,
        required: true,
        default: shortId.generate
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    },
})

// Export the schema model to the database
// mg.model() = function that takes <nameOfModel> <modelSchema>
module.exports = mongoose.model('ShortUrl', shortUrlSchema)