import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';

import { authRegisterV1, authLoginV1 } from './auth';
import { channelsCreateV1 } from './channels';
import { userProfileV1 } from './users';
import { dmCreateV1 } from './dm';
import { clearV1 } from './other';
// Set up web app, use JSON
const app = express();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// auth functions
app.post('/auth/register/v2', (req, res, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    return res.json(authRegisterV1(email, password, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login/v2', (req, res, next) => {
  try {
    const { email, password } = req.body;
    return res.json(authLoginV1(email, password));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// channels functions
app.post('/channels/create/v2', (req, res, next) => {
  try {
    const { token, name, isPublic } = req.body;
    return res.json(channelsCreateV1(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// user functions
app.get('/user/profile/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const uId = req.query.uId as string;

    return res.json(userProfileV1(token, parseInt(uId)));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// dm functions
app.post('/dm/create/v2', (req, res, next) => {
  try {
    const { token, uIds } = req.body;
    return res.json(dmCreateV1(token, uIds));
  } catch (err) {
    next(err);
  }
});
// ================================================================ //
// other functions

app.delete('/clear/v1', (req, res, next) => {
  try {
    return res.json(clearV1());
  } catch (err) {
    next(err);
  }
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
