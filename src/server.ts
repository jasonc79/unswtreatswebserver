import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

import { authRegisterV1, authLoginV1 } from './auth';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { userProfileV1 } from './users';
import { clearV1 } from './other';
import { channelMessagesV1, channelDetailsV1 } from './channel';
// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

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
// Auth functions
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
// Channels functions
app.post('/channels/create/v2', (req, res, next) => {
  try {
    const { token, name, isPublic } = req.body;
    return res.json(channelsCreateV1(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    return res.json(channelsListV1(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    return res.json(channelsListallV1(token));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// channel functions

app.get('/channel/messages/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const channelId = parseInt(req.query.channelId as string);
    const start = parseInt(req.query.start as string);
    return res.json(channelMessagesV1(token, channelId, start));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const channelId = parseInt(req.query.channelId as string);
    return res.json(channelDetailsV2(token, channelIds));
  } catch (err) {
    next(err);
  }
});

app.post('channel/leave/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const channelId = parseInt(req.query.token as string);
    const { token, channelId } = req.body;
    return res.json(channelLeaveV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('channel/addowner/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const channelId = parseInt(req.query.channelId as string);
    const uId = parseInt(req.query.uId as string);
    const { token, channelId, uId } = req.body;
    return res.json(channelAddOwnerV1(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('channel/removeowner/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const channelId = parseInt(req.query.channelId as string);
    const uId = parseInt(req.query.uId as string);
    const { token, channelId, uId } = req.body;
    return res.json(channelRemoveOwnerV1(token, channelId, uId));
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
// Other functions

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
