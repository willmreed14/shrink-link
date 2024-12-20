const express = require('express') // require the express library
const app = express() // running express() gives a variable that we store in 'app'

// Setup views to use the ejs view engine (which is express)
app.set('view engine', 'ejs')

// Define a route to index page
// In other words, render everything in index.ejs out to frontend.
app.get('/', (req, res) => {
    res.render('index') // Return the index.ejs page in /views
})

/*
Pass in the port number to listen to.

We're using process.env.PORT bc when deployed, we can set
the port environment variable and use that.

However, for local use, we can default to port 5000 instead.
*/
app.listen(process.env.PORT || 5000);