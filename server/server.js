// Import the required libraries
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const openai = require('openai');
const mysql = require('mysql2/promise');

// Initialize the Express application
const app = express();

// allow cross-origin requests
const corsOptions = {
  origin: 'http://localhost:3000'
};
app.use(cors(corsOptions));

// Set up the Express middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));
app.use(passport.initialize());

// Set up the OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
openai.apiKey = OPENAI_API_KEY;

// Set up the database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Set up the Passport authentication strategy
passport.use(
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [payload.id]);
        const user = rows[0];
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (err) {
        done(err, false);
      }
    }
  )
);

// Set up the routes
app.post('/api/authenticate', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
    } else {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          const token = await promisify(jwt.sign)({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
          res.json({ token });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to authenticate user' });
  }
});

app.post('/api/register', async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Check if email and username already exist in the database
  try {
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already in use' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to check for existing user' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the new user into the database
  try {
    await db.query('INSERT INTO users (fullName, email, username, password) VALUES (?, ?, ?, ?)', [
      fullName,
      email,
      username,
      hashedPassword,
    ]);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.get('/api/search', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { query } = req.query;
  if (!query) {
    res.status(400).json({ message: 'Missing query parameter' });
  } else {
    try {
      const response = await openai.complete({
        engine: 'davinci',
        prompt: query,
      });
      const choices = response.choices.map((choice) => choice.text);
      res.json({ choices });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to process search query' });
    }
  }
});

// route for the sign-up page:
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/client/public/signup.html');
});

app.post('/signup', async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Check if email and username already exist in the database
  console.log('Sign-up request received');
  try {
    console.log(`Checking for existing user with email ${email} or username ${username}`);
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already in use' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to check for existing user' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the new user into the database
  try {
    await db.query('INSERT INTO users (fullName, email, username, password) VALUES (?, ?, ?, ?)', [
      fullName,
      email,
      username,
      hashedPassword,
    ]);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
