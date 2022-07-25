import { error, errorMsg, getData, setData } from './dataStore';
import {
  checkValidChannel,
  checkValidToken,
  checkValidDm,
  checkValidChannelMessage,
  checkValidDmMessage,
  checkChannelMessageSender,
  checkDmMessageSender,
  returnValidChannel,
  returnValidDm,
  returnValidMessagefromChannel,
  returnValidMessagefromDm,
  getIdfromToken,
  getChannelfromMessage,
  getDmfromMessage,
  isMember,
  isOwner,
  isMemberDm,
  isOwnerDm,
} from './helper';
import HTTPError from 'http-errors';

type messageId = { messageId: number };

/**
 * messageSendV1
 * Sends a message to a specified channel
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel beign accessed
 * @param {string} message is the message the user wants to send
 *
 * Return Values:
 * @returns { error }
 *    if the token is invalid
 *    if the channelId is invalid
 * @returns { messageId: messageId } if a message is sent without any errors
 */
function messageSendV1(token: string, channelId: number, message: string) : messageId | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidChannel(channelId)) {
    throw HTTPError(400,'Channel ID does not refer to a valid channel');
  }
  if (!isMember(token, channelId)) {
    throw HTTPError(403, 'The authorised user is not a member of the channel');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Length of message must be 1-1000 inclusive');
  }
  const data = getData();
  const cuurentChannel = returnValidChannel(channelId);
  const newMessage = {
    messageId: Math.floor(Math.random() * Date.now()),
    uId: getIdfromToken(token),
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
  };
  for (const channel of data.channels) {
    if (channel.channelId === cuurentChannel.channelId) {
      channel.messages.push(newMessage);
    }
  }
  setData(data);

  return { messageId: newMessage.messageId };
}

function messageSenddmV1(token: string, dmId: number, message: string) : messageId | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidDm(dmId)) {
    throw HTTPError(400,'Dm ID does not refer to a valid dm');
  }
  if (!isMemberDm(token, dmId)) {
    throw HTTPError(403, 'The authorised user is not a member of the dm');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Length of message must be 1-1000 inclusive');
  }

  const data = getData();
  const cuurentDm = returnValidDm(dmId);
  const newMessage = {
    messageId: Math.floor(Math.random() * Date.now()),
    uId: getIdfromToken(token),
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
  };

  for (const dm of data.dms) {
    if (dm.dmId === cuurentDm.dmId) {
      dm.messages.push(newMessage);
    }
  }
  setData(data);
  return { messageId: newMessage.messageId };
}

/**
 * messageEditV1
 * If the user matches the person who sent the message and the message is valid,
 * updates and edits the message
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} messageId is the id of the message beign accessed
 * @param {string} message is the new message the user wants to change to
 *
 * Returns Values:
 * @returns { error }
 *    if message is invalid
 *    if the sender is not the current user
 *    if the token is invalid
 *    if the current user doesn't have permission to edit messages
 * @returns {} if pass with no errors
 */
function messageEditV1(token: string, messageId: number, message: string) : object | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'Length of message must be less than 1000 inclusive');
  }
  if (!checkValidDmMessage(messageId) && !checkValidChannelMessage(messageId)) {
    throw HTTPError(400,'Message ID does not refer to a valid message');
  }
  let chat;
  if (checkValidDmMessage(messageId)) {
    chat = getDmfromMessage(messageId);
    if (!isMemberDm(token, chat.dmId)) {
      throw HTTPError(400, 'The authorised user is not a member of the dm');
    }
  } else {
    chat = getChannelfromMessage(messageId);
     if (!isMember(token, chat.channelId)) {
      throw HTTPError(400, 'The authorised user is not a member of the channel');
     }
  }

  if (checkValidDmMessage(messageId)) {
    if (checkDmMessageSender(token, messageId) || isOwnerDm(token, chat.dmId)) {
      editMessage(token, messageId, message, 'dms');
      return {};
    } else {
      throw HTTPError(403, 'User is not an owner of the dm');
    }
  } else if (checkValidChannelMessage(messageId)) {
    if (checkChannelMessageSender(token, messageId) || isOwner(token, chat.channelId)) {
      editMessage(token, messageId, message, 'channels');
      return {};
    } else {
      throw HTTPError(403, 'User is not an owner of the channel');
    }
  }
  throw HTTPError(403, 'User is not the sender and is not an owner');
}

/**
 * messageRemoveV1
 * Removes a message given the message's id
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} messageId is the id of the message beign accessed
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 *    if the message is invalid
 *
 * @returns {} if message is removed with no errors
 */
function messageRemoveV1(token: string, messageId: number) : object | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidDmMessage(messageId) && !checkValidChannelMessage(messageId)) {
    throw HTTPError(400,'Message ID does not refer to a valid message');
  }
  let chat;
  if (checkValidDmMessage(messageId)) {
    chat = getDmfromMessage(messageId);
    if (!isMemberDm(token, chat.dmId)) {
      throw HTTPError(400, 'The authorised user is not a member of the dm');
    }
  } else {
    chat = getChannelfromMessage(messageId);
     if (!isMember(token, chat.channelId)) {
      throw HTTPError(400, 'The authorised user is not a member of the channel');
     }
  }

  if (checkValidDmMessage(messageId)) {
    if (checkDmMessageSender(token, messageId) || isOwnerDm(token, chat.dmId)) {
      const current = getDmfromMessage(messageId);
      removeMessage(current, messageId, 'dms');
      return {};
    } else {
      throw HTTPError(403, 'User is not an owner of the dm');
    }
  } else if (checkValidChannelMessage(messageId)) {
    if (checkChannelMessageSender(token, messageId) || isOwner(token, chat.channelId)) {
      const current = getChannelfromMessage(messageId);
      removeMessage(current, messageId, 'channels');
      return {};
    } else {
      throw HTTPError(403, 'User is not an owner of the channel');
    }
  }
  throw HTTPError(403, 'User is not the sender and is not an owner');
}

// helper function 
function editMessage(token, id, message, prop) {
  const data = getData();
  if (message.length === 0) {
    messageRemoveV1(token, id);
    return;
  }
  for (const item of data[prop]) {
    for (const msg of item.messages) {
      if (msg.messageId === id) {
        msg.message = message;
      }
    }
  }
  setData(data);
}

function removeMessage(current, messageId, prop) {
  const data = getData();
  const messageList = [];
  for (const message of current.messages) {
    if (message.messageId !== messageId) {
      messageList.push(message);
    }
  }

  for (const dm of data.dms) {
    if (dm.dmId === current.dmId) {
      dm.messages = messageList;
    }
  }
  setData(data);
}

export { messageSendV1, messageSenddmV1, messageEditV1, messageRemoveV1 };
