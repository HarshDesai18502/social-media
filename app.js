const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const dotenv = require('dotenv');
const logger = require('./logger');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: `en`,
    backend: {
      loadPath: `./locales/{{lng}}/translation.json`
    }
  });

dotenv.config();

const app = express();
app.use(middleware.handle(i18next));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter }).single('imageUrl'));
app.use('/images', express.static(path.join(__dirname, 'images')));

const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(postRoutes);
app.use(authRoutes);

// For Incorrect Url
app.use((req, res) => {
  res.status(404).json({
    message: 'Page Not Found'
  });
});

// For Error Handling
app.use((error, req, res) => {
  const status = error.statusCode || 500;
  const { message, data } = error;

  res.status(status).json({
    message,
    data
  });
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(process.env.PORT);
    console.log('connected');
  })
  .catch(() => {
    logger.customerLogger.log('error', 'Error while connecting to database');
  });
