import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { authRegisterV1, authLoginV1, authLogoutV1, authPasswordRequest, authPasswordReset } from './auth';
import { dmCreateV2, dmDetailsV2, dmListV2, dmRemoveV2, dmLeaveV2, dmMessagesV2 } from './dm';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { userProfileV3, usersAllV2, userSetNameV2, userSetEmailV2, userSetHandleV2, userStatsV1, usersStatsV1 } from './users';
import { messageSendV1, messageSenddmV1, messageEditV1, messageRemoveV1, messageSendlaterV1, messageSendlaterdmV1, messageShareV1, messagePinV1, messageUnpinV1, searchV1 } from './message';
import { clearV1 } from './other';
import { channelMessagesV3, channelDetailsV2, channelLeaveV2, channelAddOwnerV2, channelRemoveOwnerV2, channelJoinV1, channelInviteV3 } from './channel';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
import { adminPermissionChangeV1, adminRemoveV1 } from './admin';
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
    const token = req.headers.token as string;
    return res.json(authLogoutV1(token));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/request/v1', (req, res, next) => {
  try {
    const { email } = req.body;
    return res.json(authPasswordRequest(email));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/reset/v1', (req, res, next) => {
  try {
    const { resetCode, newPassword } = req.body;
    return res.json(authPasswordReset(resetCode, newPassword));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// Channels functions
app.post('/channels/create/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { name, isPublic } = req.body;
    return res.json(channelsCreateV1(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    return res.json(channelsListV1(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    return res.json(channelsListallV1(token));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// channel functions

app.get('/channel/messages/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = parseInt(req.query.channelId as string);
    const start = parseInt(req.query.start as string);
    return res.json(channelMessagesV3(token, channelId, start));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = parseInt(req.query.channelId as string);
    return res.json(channelDetailsV2(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId } = req.body;
    return res.json(channelLeaveV2(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    return res.json(channelInviteV3(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    return res.json(channelAddOwnerV2(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    return res.json(channelRemoveOwnerV2(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId } = req.body;
    return res.json(channelJoinV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// User functions
app.get('/user/profile/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const uId = req.query.uId as string;
    return res.json(userProfileV3(token, parseInt(uId)));
  } catch (err) {
    next(err);
  }
});
app.put('/user/profile/setname/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { nameFirst, nameLast } = req.body;
    return res.json(userSetNameV2(token, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});
app.put('/user/profile/setemail/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { email } = req.body;
    return res.json(userSetEmailV2(token, email));
  } catch (err) {
    next(err);
  }
});
app.put('/user/profile/sethandle/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { handleStr } = req.body;
    return res.json(userSetHandleV2(token, handleStr));
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    return res.json(usersAllV2(token));
  } catch (err) {
    next(err);
  }
});

app.get('/user/stats/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    return res.json(userStatsV1(token));
  } catch (err) {
    next(err);
  }
});

app.get('/users/stats/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    return res.json(usersStatsV1(token));
  } catch (err) {
    next(err);
  }
});
// ================================================================ //
// Message functions
app.post('/message/send/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, message } = req.body;
    return res.json(messageSendV1(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { dmId, message } = req.body;
    return res.json(messageSenddmV1(token, dmId, message));
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { messageId, message } = req.body;
    return res.json(messageEditV1(token, messageId, message));
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const messageId = req.query.messageId as string;
    return res.json(messageRemoveV1(token, parseInt(messageId)));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlater/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, message, timeSent } = req.body;
    return res.json(messageSendlaterV1(token, channelId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { messageId } = req.body;
    return res.json(messagePinV1(token, parseInt(messageId)));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { messageId } = req.body;
    return res.json(messageUnpinV1(token, parseInt(messageId)));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { dmId, message, timeSent } = req.body;
    return res.json(messageSendlaterdmV1(token, dmId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.post('/message/share/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { ogMessageId, message, channelId, dmId } = req.body;
    return res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
  } catch (err) {
    next(err);
  }
});
app.get('/search/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const queryStr = req.query.queryStr as string;
    return res.json(searchV1(token, queryStr));
  } catch (err) {
    next(err);
  }
});
// ================================================================ //
// dm functions
app.post('/dm/create/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { uIds } = req.body;
    return res.json(dmCreateV2(token, uIds));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.query.dmId as string;
    return res.json(dmDetailsV2(token, parseInt(dmId)));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    return res.json(dmListV2(token));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.query.dmId as string;
    return res.json(dmRemoveV2(token, parseInt(dmId)));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { dmId } = req.body;
    return res.json(dmLeaveV2(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = parseInt(req.query.dmId as string);
    const start = parseInt(req.query.start as string);
    return res.json(dmMessagesV2(token, dmId, start));
  } catch (err) {
    next(err);
  }
});

// Standup functions

app.post('/standup/start/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, length } = req.body;
    return res.json(standupStartV1(token, channelId, length));
  } catch (err) {
    next(err);
  }
});

app.get('/standup/active/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    // const token = req.query.token as string;
    const channelId = parseInt(req.query.channelId as string);
    return res.json(standupActiveV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, message } = req.body;
    return res.json(standupSendV1(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

// ================================================================ //
// Admin functions

app.delete('/admin/user/remove/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const uId = parseInt(req.query.uId as string);
    return res.json(adminRemoveV1(token, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/admin/userpermission/change/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { uId, permissionId } = req.body;
    return res.json(adminPermissionChangeV1(token, uId, permissionId));
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

// =================================================================//
// handles errors nicely
app.use(errorHandler());

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
