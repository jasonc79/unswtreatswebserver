import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { dmCreateV2, dmDetailsV2, dmListV2, dmRemoveV2, dmLeaveV2, dmMessagesV1 } from './dm';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { userProfileV1, usersAllV1, userSetNameV1, userSetEmailV1, userSetHandleV1 } from './users';
import { messageSendV1, messageSenddmV1, messageEditV1, messageRemoveV1 } from './message';
import { clearV1 } from './other';
import { channelMessagesV2, channelDetailsV2, channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1, channelJoinV1, channelInviteV3 } from './channel';
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

// handles errors nicely
app.use(errorHandler());

// ================================================================ //
// Auth functions
app.post('/auth/register/v3', (req, res, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    return res.json(authRegisterV1(email, password, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login/v3', (req, res, next) => {
  try {
    const { email, password } = req.body;
    return res.json(authLoginV1(email, password));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v2', (req, res, next) => {
  try {
    const { token } = req.body;
    return res.json(authLogoutV1(token));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// Channels functions
app.post('/channels/create/v3', (req, res, next) => {
  try {
    const { token, name, isPublic } = req.body;
    return res.json(channelsCreateV1(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', (req, res, next) => {
  try {
    const token = req.query.token as string;
    return res.json(channelsListV1(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', (req, res, next) => {
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
    return res.json(channelMessagesV2(token, channelId, start));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const channelId = parseInt(req.query.channelId as string);
    return res.json(channelDetailsV2(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v1', (req, res, next) => {
  try {
    const { token, channelId } = req.body;
    return res.json(channelLeaveV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v3', (req, res, next) => {
  try {
    const { token, channelId, uId } = req.body;
    return res.json(channelInviteV3(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v1', (req, res, next) => {
  try {
    const { token, channelId, uId } = req.body;
    return res.json(channelAddOwnerV1(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v1', (req, res, next) => {
  try {
    const { token, channelId, uId } = req.body;
    return res.json(channelRemoveOwnerV1(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v2', (req, res, next) => {
  try {
    const { token, channelId } = req.body;
    return res.json(channelJoinV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// User functions
app.get('/user/profile/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const uId = req.query.uId as string;
    return res.json(userProfileV1(token, parseInt(uId)));
  } catch (err) {
    next(err);
  }
});
app.put('/user/profile/setname/v1', (req, res, next) => {
  try {
    const { token, nameFirst, nameLast } = req.body;
    return res.json(userSetNameV1(token, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});
app.put('/user/profile/setemail/v1', (req, res, next) => {
  try {
    const { token, email } = req.body;
    return res.json(userSetEmailV1(token, email));
  } catch (err) {
    next(err);
  }
});
app.put('/user/profile/sethandle/v1', (req, res, next) => {
  try {
    const { token, handleStr } = req.body;
    return res.json(userSetHandleV1(token, handleStr));
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
// Message functions
app.post('/message/send/v2', (req, res, next) => {
  try {
    const { token, channelId, message } = req.body;
    return res.json(messageSendV1(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v2', (req, res, next) => {
  try {
    const { token, dmId, message } = req.body;
    return res.json(messageSenddmV1(token, dmId, message));
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', (req, res, next) => {
  try {
    const { token, messageId, message } = req.body;
    return res.json(messageEditV1(token, messageId, message));
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const messageId = req.query.messageId as string;
    return res.json(messageRemoveV1(token, parseInt(messageId)));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// dm functions
app.post('/dm/create/v2', (req, res, next) => {
  try {
    const { token, uIds } = req.body;
    return res.json(dmCreateV2(token, uIds));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const dmId = req.query.dmId as string;

    return res.json(dmDetailsV2(token, parseInt(dmId)));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;

    return res.json(dmListV2(token));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const dmId = req.query.dmId as string;

    return res.json(dmRemoveV2(token, parseInt(dmId)));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req, res, next) => {
  try {
    const { token, dmId } = req.body;
    return res.json(dmLeaveV2(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    const start = parseInt(req.query.start as string);
    return res.json(dmMessagesV1(token, dmId, start));
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
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
