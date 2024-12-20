const express = require('express') // require the express library
const mongoose = require('mongoose') // require mongoose library
const ShortUrl = require('./models/shortUrl') // Require the ShortUrl model we made in shortUrl.js

// express() runs an express app stored in 'app'
const app = express() 

/* --- To start: npm run devStart --- */

// Connect to the Mongo database
/*
mongoose.connect('mongodb://localhost/urlShortener')
    // display a message depending on if connection was successful
    .then(() => console.log('Connected to the database!'))
    .catch(err => console.error('Connection error:', err));
*/
// Setup views to use the ejs view engine (which is express)
app.set('view engine', 'ejs')

// Tell app we are using url parameters.
app.use(express.urlencoded({ extended: false }))

// Define a route to index page
// In other words, render everything in index.ejs out to frontend.
app.get('/', (req, res) => {
    res.render('index') // Return the index.ejs page in /views
})

// Create a new shortUrl in the database
// async: make this function asynchronus
/*
app.post('/shortUrls', async (req, res) => {
    // Pass in the full url to create a short one
    // Grab full url from body -> fullUrl (in index.js)

    // await: wait for this line to complete before proceeding.
    await ShortUrl.create({ full: req.body.fullUrl })

    // proceed: Redirect user back to homepage after completion
    res.redirect('/')
})
    */
/*
Pass in the port number to listen to.

We're using process.env.PORT bc when deployed, we can set
the port environment variable and use that.

However, for local use, we can default to port 5000 instead.
*/
app.listen(process.env.PORT || 5000);