import { error, getData, setData, Message, Channel, Dm, MessageId } from './dataStore';
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
  returnChannelListFromUId,
  returnDmListFromUId,
  getIdfromToken,
  getChannelfromMessage,
  getDmfromMessage,
  isMember,
  isOwner,
  isMemberDm,
  isOwnerDm,
} from './helper';
import HTTPError from 'http-errors';
import { notifyTag } from './notifications';

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
function messageSendV1(token: string, channelId: number, message: string) : MessageId | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'Channel ID does not refer to a valid channel');
  }
  if (!isMember(token, channelId)) {
    throw HTTPError(403, 'The authorised user is not a member of the channel');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Length of message must be 1-1000 inclusive');
  }
  const data = getData();
  const cuurentChannel = returnValidChannel(channelId);
  const newMessage = createMessage(token, message);

  for (const channel of data.channels) {
    if (channel.channelId === cuurentChannel.channelId) {
      channel.messages.push(newMessage);
    }
  }
  setData(data);
  notifyTag(token, message, newMessage.messageId, channelId, -1);
  return { messageId: newMessage.messageId };
}

function messageSenddmV1(token: string, dmId: number, message: string) : MessageId | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidDm(dmId)) {
    throw HTTPError(400, 'Dm ID does not refer to a valid dm');
  }
  if (!isMemberDm(token, dmId)) {
    throw HTTPError(403, 'The authorised user is not a member of the dm');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Length of message must be 1-1000 inclusive');
  }

  const data = getData();
  const cuurentDm = returnValidDm(dmId);
  const newMessage = createMessage(token, message);

  for (const dm of data.dms) {
    if (dm.dmId === cuurentDm.dmId) {
      dm.messages.push(newMessage);
    }
  }
  setData(data);
  notifyTag(token, message, newMessage.messageId, -1, dmId);
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
    throw HTTPError(400, 'Message ID does not refer to a valid message');
  }
  let dm;
  let channel;
  if (checkValidDmMessage(messageId)) {
    dm = getDmfromMessage(messageId);
    if (!isMemberDm(token, dm.dmId)) {
      throw HTTPError(400, 'The authorised user is not a member of the dm');
    }
  } else {
    channel = getChannelfromMessage(messageId);
    if (!isMember(token, channel.channelId)) {
      throw HTTPError(400, 'The authorised user is not a member of the channel');
    }
  }

  if (checkValidDmMessage(messageId)) {
    if (checkDmMessageSender(token, messageId) || isOwnerDm(token, dm.dmId)) {
      editMessage(token, messageId, message, 'dms');
      notifyTag(token, message, messageId, -1, dm.dmId);
    } else {
      throw HTTPError(403, 'User is not an owner of the dm');
    }
  } else if (checkValidChannelMessage(messageId)) {
    if (checkChannelMessageSender(token, messageId) || isOwner(token, channel.channelId)) {
      editMessage(token, messageId, message, 'channels');
      notifyTag(token, message, messageId, channel.channelId, -1);
    } else {
      throw HTTPError(403, 'User is not an owner of the channel');
    }
  }
  return {};
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
    throw HTTPError(400, 'Message ID does not refer to a valid message');
  }
  let dm;
  let channel;
  if (checkValidDmMessage(messageId)) {
    dm = getDmfromMessage(messageId);
    if (!isMemberDm(token, dm.dmId)) {
      throw HTTPError(400, 'The authorised user is not a member of the dm');
    }
  } else {
    channel = getChannelfromMessage(messageId);
    if (!isMember(token, channel.channelId)) {
      throw HTTPError(400, 'The authorised user is not a member of the channel');
    }
  }

  const data = getData();

  if (checkValidDmMessage(messageId)) {
    if (checkDmMessageSender(token, messageId) || isOwnerDm(token, dm.dmId)) {
      const currentDm = getDmfromMessage(messageId);
      const messageDetails = returnValidMessagefromDm(messageId);
      const messageList = [];

      for (const message of currentDm.messages) {
        if (message.messageId !== messageDetails.messageId) {
          messageList.push(message);
        }
      }

      for (const dm of data.dms) {
        if (dm.dmId === currentDm.dmId) {
          dm.messages = messageList;
        }
      }
      setData(data);
      return {};
    } else {
      throw HTTPError(403, 'User is not an owner of the dm');
    }
  } else if (checkValidChannelMessage(messageId)) {
    if (checkChannelMessageSender(token, messageId) || isOwner(token, channel.channelId)) {
      const currentChannel = getChannelfromMessage(messageId);
      const messageDetails = returnValidMessagefromChannel(messageId);

      const messageList = [];

      for (const message of currentChannel.messages) {
        if (message.messageId !== messageDetails.messageId) {
          messageList.push(message);
        }
      }

      for (const channel of data.channels) {
        if (channel.channelId === currentChannel.channelId) {
          channel.messages = messageList;
        }
      }
      setData(data);
      return {};
    } else {
      throw HTTPError(403, 'User is not an owner of the channel');
    }
  }
}

function messageSendlaterV1(token: string, channelId: number, message: string, timeSent: number) : MessageId | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'Channel ID does not refer to a valid channel');
  }
  if (timeSent < Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }
  if (!isMember(token, channelId)) {
    throw HTTPError(403, 'The authorised user is not a member of the channel');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Length of message must be 1-1000 inclusive');
  }
  const msgId = Math.floor(Math.random() * Date.now());
  const seconds = timeSent - Math.floor((new Date()).getTime() / 1000);
  setTimeout(() => { sendChannelMessage(token, channelId, message, msgId); }, seconds * 1000);
  // console.log('msgId =', msgId);
  return { messageId: msgId };
}

function messageSendlaterdmV1(token: string, dmId: number, message: string, timeSent: number) : MessageId | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidDm(dmId)) {
    throw HTTPError(400, 'Dm ID does not refer to a valid dm');
  }
  if (timeSent < Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }
  if (!isMemberDm(token, dmId)) {
    throw HTTPError(403, 'The authorised user is not a member of the channel');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Length of message must be 1-1000 inclusive');
  }
  const msgId = Math.floor(Math.random() * Date.now());
  const seconds = timeSent - Math.floor((new Date()).getTime() / 1000);
  setTimeout(() => { sendDmMessage(token, dmId, message, msgId); }, seconds * 1000);
  return { messageId: msgId };
}

function sendChannelMessage(token: string, channelId: number, message: string, msgId: number) {
  const data = getData();
  const cuurentChannel = returnValidChannel(channelId);
  const newMessage = {
    messageId: msgId,
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
}

function sendDmMessage(token: string, dmId: number, message: string, msgId: number) {
  const data = getData();
  const cuurentDm = returnValidDm(dmId);
  const newMessage = {
    messageId: msgId,
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
}

function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  } else if (!checkValidChannel(channelId) && !checkValidDm(dmId)) {
    throw HTTPError(400, 'Channel ID does not refer to a valid channel');
  } else if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'Neither dmId or channelId is -1');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'Length of message must be less than 1000 inclusive');
  }
  const isOgMessage = checkValidChannelMessage(ogMessageId);
  const isOgDm = checkValidDmMessage(ogMessageId);
  let ogMessage: Message;
  let newMessageId: number;

  if (!isOgMessage && !isOgDm) {
    throw HTTPError(400, 'ogMessageId does not refer to valid channel or channel that the authorised user has joined');
  } else if (isOgMessage) {
    ogMessage = returnValidMessagefromChannel(ogMessageId);
  } else if (isOgDm) {
    ogMessage = returnValidMessagefromDm(ogMessageId);
  }
  const concatMessage = concatMessageString(ogMessage.message, message);
  // Sharing a message with a channel
  if (dmId === -1) {
    if (!isMember(token, channelId)) {
      throw HTTPError(403, 'Authorised user is not a member of the channel they are sharing a message to');
    }
    newMessageId = (messageSendV1(token, channelId, concatMessage) as MessageId).messageId;
  } // Sharing a message with a dm
  if (channelId === -1) {
    if (!isMemberDm(token, dmId)) {
      throw HTTPError(403, 'Authorised user is not a member of the dm they are sharing a message to');
    }
    newMessageId = (messageSenddmV1(token, dmId, concatMessage) as MessageId).messageId;
  }
  return { sharedMessageId: newMessageId };
}

/**
 * searchV1
 * Given a query string, return a collection of messages in all of the
 * channels/DMs that the user has joined that contain the query
 * (case-insensitive). There is no expected order for these messages.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} queryStr is the queryStr that is used to search through each message
 *
 * Returns Values:
 * @returns { error }
 *    if the token is invalid
 *    if length of queryStr is less than 1 or over 1000 characters
 * @returns { messages } if pass with no errors
 */

function searchV1(token: string, queryStr: string) {
  queryStr = queryStr.toLowerCase();
  const queryStrLength = queryStr.length;
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const messages = [];
  if (queryStrLength < 1) {
    throw HTTPError(400, 'Length of queryStr is less than 1 character long');
  } if (queryStrLength > 1000) {
    throw HTTPError(400, 'Length of queryStr is more than 1000 characters long');
  }
  const uId = getIdfromToken(token);
  const channelList = returnChannelListFromUId(uId);
  const dmList = returnDmListFromUId(uId);
  for (const channel of channelList) {
    for (const message of channel.messages) {
      if (message.message.toLowerCase().includes(queryStr)) {
        messages.push(message);
      }
    }
  }
  for (const dm of dmList) {
    for (const message of dm.messages) {
      if (message.message.toLowerCase().includes(queryStr)) {
        messages.push(message);
      }
    }
  }
  return { messages };
}

// helper function
const genEditMessage = (dataProp: Channel[] | Dm[]) => {
  return (id: number, message: string) : Channel[] | Dm[] => {
    for (const item of dataProp) {
      for (const msg of item.messages) {
        if (msg.messageId === id) {
          msg.message = message;
        }
      }
    }
    return dataProp;
  };
};

function editMessage(token: string, id: number, message: string, prop: string) {
  const data = getData();
  if (message.length === 0) {
    messageRemoveV1(token, id);
    return;
  }
  const editMessageChannel = genEditMessage(data.channels);
  const editMessageDm = genEditMessage(data.dms);
  if (prop === 'dms') {
    data.dms = editMessageDm(id, message) as Dm[];
  } else if (prop === 'channels') {
    data.channels = editMessageChannel(id, message) as Channel[];
  }
  setData(data);
}

function createMessage(token: string, messageStr: string): Message {
  const message: Message = {
    messageId: Math.floor(Math.random() * Date.now()),
    uId: getIdfromToken(token),
    message: messageStr,
    timeSent: Math.floor((new Date()).getTime() / 1000),
  };
  return message;
}

function concatMessageString(ogMessage: string, optionalMessage: string): string {
  const newMessage = optionalMessage + '\n= = = = =\n' + ogMessage + '\n= = = = =\n';
  return newMessage;
}

export { messageSendV1, messageSenddmV1, messageEditV1, messageRemoveV1, messageSendlaterV1, messageSendlaterdmV1, messageShareV1, searchV1 };
