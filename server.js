// server.js

const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

require('dotenv').config();

const app = express();

const client = jwksClient({
    jwksUri: `https://cognito-idp.us-east-1.amazonaws.com/YOUR_USER_POOL_ID/.well-known/jwks.json`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) return res.sendStatus(401);
        req.user = decoded;
        next();
    });
}

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
    let shortUrls = [];

    // Check if user is authenticated
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        try {
            const decoded = await new Promise((resolve, reject) => {
                jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
                    if (err) reject(err);
                    resolve(decoded);
                });
            });

            // Fetch links for authenticated user
            shortUrls = await ShortUrl.find({ userId: decoded.sub });
        } catch (error) {
            console.error('Error verifying token:', error);
        }
    }

    res.render('index', { shortUrls });
});


// Adds userID to every link a user creates.
app.post('/shortUrls', authenticateToken, async (req, res) => {
    try {
        const fullUrl = req.body.fullUrl;
        if (!fullUrl) {
            return res.status(400).send('Full URL is required');
        }

        await ShortUrl.create({ full: fullUrl, userId: req.user.sub });
        res.redirect('/');
    } catch (error) {
        console.error('Error creating short URL:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/:shortUrl', authenticateToken, async (req, res) => {
    try {
        const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl, userId: req.user.sub });
        if (!shortUrl) {
            return res.status(404).send('Short URL not found or unauthorized');
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
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
