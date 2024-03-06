// imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// set template engine
app.set('view engine', 'ejs');

// Routes
app.use('', require('./routes/routes'));

// Server listening
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
