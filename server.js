// server.js

const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

require('dotenv').config();

const app = express();

// 🔹 ADD THIS CSP MIDDLEWARE HERE
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy",
        "default-src 'self' https://*.amazoncognito.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;" +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.amazoncognito.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;" +
        "connect-src 'self' https://*.amazoncognito.com https://cognito-idp.us-east-1.amazonaws.com;" +
        "frame-src 'self' https://*.amazoncognito.com;" +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;"
    );
    next();
});


const client = jwksClient({
    jwksUri: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_vJhXhdYyl/.well-known/jwks.json`
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
app.use(express.json()); // ✅ ADD THIS LINE TO ENABLE JSON PARSING
app.use(express.static('public'));

// Routes
app.get('/callback', (req, res) => {
    res.render('callback');
});

app.get('/', async (req, res) => {
    let shortUrls = [];
    let user = null; // Default to null (not logged in)

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

            user = decoded; // Store user details
            shortUrls = await ShortUrl.find({ userId: decoded.sub });
        } catch (error) {
            console.error('Error verifying token:', error);
        }
    }

    res.render('index', { shortUrls, user });
});


// Adds userID to every link a user creates.
app.post('/shortUrls', authenticateToken, async (req, res) => {
    try {
        const { fullUrl } = req.body;
        if (!fullUrl) {
            return res.status(400).json({ error: "Full URL is required" }); // ✅ Return JSON error instead of HTML
        }

        const newShortUrl = await ShortUrl.create({ full: fullUrl, userId: req.user.sub });
        res.json(newShortUrl); // ✅ Ensure response is JSON
    } catch (error) {
        console.error('❌ Error creating short URL:', error);
        res.status(500).json({ error: "Internal Server Error" }); // ✅ Return JSON for server errors
    }
});


app.get('/', authenticateToken, async (req, res) => {
    try {
        let shortUrls = [];
        let user = null;

        // If user is authenticated, fetch their links
        if (req.user) {
            user = req.user;
            shortUrls = await ShortUrl.find({ userId: user.sub }); // ✅ Fetch only this user's links
        }

        res.render('index', { shortUrls, user });
    } catch (error) {
        console.error("❌ Error fetching user links:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/user/shortUrls', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const shortUrls = await ShortUrl.find({ userId: req.user.sub }); // ✅ Fetch only the user's links
        res.json(shortUrls);
    } catch (error) {
        console.error("❌ Error fetching user links:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Start Server
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
