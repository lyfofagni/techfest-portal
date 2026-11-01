const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { body, validationResult } = require('express-validator');
const User = require('./models/User');
const Feedback = require('./models/Feedback');

const isProd = process.env.NODE_ENV === 'production';
const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// strips keys starting with $ or containing . from the request body
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/register',
  body('name').trim().notEmpty().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    try {
      const { name, email, password } = req.body;
      const user = await User.create({ name, email, password });
      res.status(201).json({ id: user._id });
    } catch (e) {
      res.status(400).json({ error: 'Registration failed' });
    }
  });

app.post('/api/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6 }),
  async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const user = await User.findOne({
      email: String(req.body.email),
      password: String(req.body.password)
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000
    });
    res.json({ message: 'Logged in', name: user.name });
  });

app.get('/api/feedback', async (req, res) => {
  res.json(await Feedback.find().sort({ createdAt: -1 }));
});

app.post('/api/feedback',
  body('message').isString().trim().notEmpty().isLength({ max: 500 }),
  async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const f = await Feedback.create({ message: req.body.message });
    res.status(201).json(f);
  });

module.exports = app;