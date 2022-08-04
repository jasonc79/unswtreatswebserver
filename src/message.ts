import { error, getData, setData, Message, Channel, Dm, MessageId, messagesExist, messagesSent } from './dataStore';
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
  isGlobalOwner,
  returnValidUser,
} from './helper';
import HTTPError from 'http-errors';

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

  const user = returnValidUser(token);
  const timeStamp = Math.floor((new Date()).getTime() / 1000);
  ///
  const temp: messagesExist = {
    numMessagesExist: data.totalMessagesExist += 1,
    timeStamp: timeStamp,
  };
  data.messagesExist.push(temp);

  ///
  const temp1: messagesSent = {
    numMessagesSent: data.users[user.uId].totalMessagesSent += 1,
    timeStamp: timeStamp,
  };
  data.users[user.uId].messagesSent.push(temp1);
  ///

  setData(data);

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

  const user = returnValidUser(token);
  const timeStamp = Math.floor((new Date()).getTime() / 1000);
  ///
  const temp: messagesExist = {
    numMessagesExist: data.totalMessagesExist += 1,
    timeStamp: timeStamp,
  };
  data.messagesExist.push(temp);

  ///
  const temp1: messagesSent = {
    numMessagesSent: data.users[user.uId].totalMessagesSent += 1,
    timeStamp: timeStamp,
  };
  data.users[user.uId].messagesSent.push(temp1);

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
      return {};
    } else {
      throw HTTPError(403, 'User is not an owner of the dm');
    }
  } else if (checkValidChannelMessage(messageId)) {
    if (checkChannelMessageSender(token, messageId) || isOwner(token, channel.channelId)) {
      editMessage(token, messageId, message, 'channels');
      return {};
    } else {
      throw HTTPError(403, 'User is not an owner of the channel');
    }
  }
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
  const timeStamp = Math.floor((new Date()).getTime() / 1000);

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
      ///
      const temp: messagesExist = {
        numMessagesExist: data.totalMessagesExist += -1,
        timeStamp: timeStamp,
      };
      data.messagesExist.push(temp);

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
      ///
      const temp: messagesExist = {
        numMessagesExist: data.totalMessagesExist += -1,
        timeStamp: timeStamp,
      };
      data.messagesExist.push(temp);

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
    isPinned: false,
  };
  for (const channel of data.channels) {
    if (channel.channelId === cuurentChannel.channelId) {
      channel.messages.push(newMessage);
    }
  }
  ///
  const timeStamp = Math.floor((new Date()).getTime() / 1000);
  const temp: messagesExist = {
    numMessagesExist: data.totalMessagesExist += 1,
    timeStamp: timeStamp,
  };
  data.messagesExist.push(temp);

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
    isPinned: false,
  };

  for (const dm of data.dms) {
    if (dm.dmId === cuurentDm.dmId) {
      dm.messages.push(newMessage);
    }
  }

  const timeStamp = Math.floor((new Date()).getTime() / 1000);
  const temp: messagesExist = {
    numMessagesExist: data.totalMessagesExist += 1,
    timeStamp: timeStamp,
  };
  data.messagesExist.push(temp);

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

  const data = getData();
  const timeStamp = Math.floor((new Date()).getTime() / 1000);
  const temp: messagesExist = {
    numMessagesExist: data.totalMessagesExist += 1,
    timeStamp: timeStamp,
  };
  data.messagesExist.push(temp);
  setData(data);

  return { sharedMessageId: newMessageId };
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

function messagePinV1(token: string, messageId: number): (object) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const data = getData();
  // check if there is a matching id in channels
  let message;
  for (const channel of data.channels) {
    /// find messageId in message[] of each channel
    message = channel.messages.find(message => message.messageId === messageId);
    if (message !== undefined) {
      /// if message exists check if user has owner permissions
      if (!isOwner(token, channel.channelId) && !isGlobalOwner(token)) {
        throw HTTPError(403, 'messageId refers to a valid message in a joined channel and the authorised user does not have owner permissions in the channel');
      }
    }
  }
  for (const dm of data.dms) {
    /// find messageId in message[] of each dm
    message = dm.messages.find(message => message.messageId === messageId);
    if (message !== undefined) {
      /// if message exists check if user has owner permissions
      if (!isOwnerDm(token, dm.dmId) && !isGlobalOwner(token)) {
        throw HTTPError(403, 'messageId refers to a valid message in a joined DM and the authorised user does not have owner permissions in the DM');
      }
    }
  }
  if (message === undefined) {
    /// if message was not found return this error.
    throw HTTPError(400, 'messageId is not a valid message within a channel or DM that the authorised user has joined');
  }
  if (message.isPinned === true) {
    throw HTTPError(400, 'the message is already pinned');
  }
  message.isPinned = true;
  setData(data);
  return {};
}

function messageUnpinV1(token: string, messageId: number): (object) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const data = getData();
  // check if there is a matching id in channels
  let message;
  for (const channel of data.channels) {
    message = channel.messages.find(message => message.messageId === messageId);
    if (message !== undefined) {
      if (!isOwner(token, channel.channelId) && !isGlobalOwner(token)) {
        throw HTTPError(403, 'messageId refers to a valid message in a joined channel and the authorised user does not have owner permissions in the channel');
      }
    }
  }
  for (const dm of data.dms) {
    message = dm.messages.find(message => message.messageId === messageId);
    if (message !== undefined) {
      if (!isOwnerDm(token, dm.dmId) && !isGlobalOwner(token)) {
        throw HTTPError(403, 'messageId refers to a valid message in a joined DM and the authorised user does not have owner permissions in the DM');
      }
    }
  }
  if (message === undefined) {
    throw HTTPError(400, 'messageId is not a valid message within a channel or DM that the authorised user has joined');
  }
  if (message.isPinned === false) {
    throw HTTPError(400, 'the message is not already pinned');
  }
  message.isPinned = false;
  setData(data);
  return {};
}

function createMessage(token: string, messageStr: string): Message {
  const message: Message = {
    messageId: Math.floor(Math.random() * Date.now()),
    uId: getIdfromToken(token),
    message: messageStr,
    timeSent: Math.floor((new Date()).getTime() / 1000),
    isPinned: false,
  };
  return message;
}

function concatMessageString(ogMessage: string, optionalMessage: string): string {
  const newMessage = optionalMessage + '\n= = = = =\n' + ogMessage + '\n= = = = =\n';
  return newMessage;
}

export { messageSendV1, messageSenddmV1, messageEditV1, messageRemoveV1, messageSendlaterV1, messageSendlaterdmV1, messageShareV1, messagePinV1, messageUnpinV1 };
