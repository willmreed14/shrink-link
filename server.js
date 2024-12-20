const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
require('dotenv').config();

const app = express();

// Verify that the .env file is being loaded properly.
console.log('Mongo URI:', process.env.MONGO_URI);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Routes
app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find()
    res.render('index', {shortUrls: shortUrls });
});

app.post('/shortUrls', async (req, res) => {
    try {
        const fullUrl = req.body.fullUrl;
        if (!fullUrl) {
            return res.status(400).send('Full URL is required');
        }

        await ShortUrl.create({ full: fullUrl });
        res.redirect('/');
    } catch (error) {
        console.error('Error creating short URL:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/:shortUrl', async (req, res) => {
    try {
        const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
        if (!shortUrl) {
            return res.status(404).send('Short URL not found');
        }

        shortUrl.clicks++;
        await shortUrl.save();

        res.redirect(shortUrl.full);
    } catch (error) {
        console.error('Error redirecting short URL:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start Server
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
