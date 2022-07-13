import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';

import { authRegisterV1, authLoginV1 } from './auth';
import { channelsCreateV1 } from './channels';
import { userProfileV1, usersAllV1 } from './users';
// import { messageSendV1, messageEditV1, messageRemoveV1 } from './message';
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

app.get('/users/all/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    return res.json(usersAllV1(token));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// message functions

// app.post('/message/send/v1', (req, res, next) => {
//   try {
//     const { token, channelId, message } = req.body;
//     return res.json(messageSendV1(token, channelId, message));
//   } catch (err) {
//     next (err);
//   }
// });

// app.put('/message/edit/v1', (req, res, next) => {
//   try {
//     const { token, messageId, message } = req.body;
//     return res.json(messageEditV1(token, messageId, message));
//   } catch (err) {
//     next (err);
//   }
// });

// app.delete('/message/remove/v1', (req, res, next) => {
//   try {
//     const { token, messageId } = req.body;
//     return res.json(messageRemoveV1(token, messageId));
//   } catch (err) {
//     next (err);
//   }
// });

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
