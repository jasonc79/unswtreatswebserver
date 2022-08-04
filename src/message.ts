import { error, getData, setData, React, Message } from './dataStore';
import {
  checkValidChannel,
  checkValidToken,
  checkValidDm,
  checkValidChannelMessage,
  checkValidDmMessage,
  checkChannelMessageSender,
  checkDmMessageSender,
  checkAlreadyReacted,
  returnValidChannel,
  returnValidDm,
  returnValidMessagefromChannel,
  returnValidMessagefromDm,
  returnValidUser,
  getIdfromToken,
  getChannelfromMessage,
  getDmfromMessage,
  isMember,
  isOwner,
  isMemberDm,
  isOwnerDm,
  checkReactId,
  checkMessageSource,
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

function messageReactV1 (token: string, messageId: number, reactId: number): error | Record<string, never> {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  if (!checkValidChannelMessage(messageId) && !checkValidDmMessage(messageId)) {
    throw HTTPError(400, 'Invalid messageId');
  }

  if (!checkReactId(reactId)) {
    throw HTTPError(400, 'Invalid reactId');
  }

  const checkReacts = checkAlreadyReacted(token, messageId, reactId);
  console.log(checkReacts);
  if (checkReacts === 2) {
    throw HTTPError(400, 'Message already contains react from authorised user');
  }

  const user = returnValidUser(token);
  const data = getData();

  // Finding current message
  let currMessage: Message;
  if (checkMessageSource(messageId) === 0) {
    for (const dm of data.dms) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          currMessage = message;
        }
      }
    }
  } else if (checkMessageSource(messageId) === 1) {
    for (const channel of data.channels) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          currMessage = message;
        }
      }
    }
  }

  // Another user has already reacted with same reactId
  if (checkReacts === 1) {
    for (const react of currMessage.reacts) {
      if (reactId === react.reactId) {
        react.uIds.push(user.uId);
      }
    }
  } else {
    const newReact : React = {
      reactId: reactId,
      uIds: [user.uId],
      isThisUserReacted: true,
    };
    // First react
    if (!('reacts' in currMessage)) {
      currMessage.reacts = [newReact];
    // First react of that reactId
    } else {
      currMessage.reacts.push(newReact);
    }
  }
  console.log(currMessage.reacts);
  setData(data);
  return {};
}

function messageUnreactV1 (token: string, messageId: number, reactId: number): error | Record<string, never> {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  if (!checkValidChannelMessage(messageId) && !checkValidDmMessage(messageId)) {
    throw HTTPError(400, 'Invalid messageId');
  }

  if (!checkReactId(reactId)) {
    throw HTTPError(400, 'Invalid reactId');
  }

  if (!checkAlreadyReacted(token, messageId, reactId)) {
    throw HTTPError(400, 'Message does not contain react from authorised user');
  }

  const user = returnValidUser(token);
  const data = getData();

  // Finding current message
  let currMessage: Message;
  if (checkMessageSource(messageId) === 0) {
    for (const dm of data.dms) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          currMessage = message;
        }
      }
    }
  } else if (checkMessageSource(messageId) === 1) {
    for (const channel of data.channels) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          currMessage = message;
        }
      }
    }
  }

  if (currMessage.reacts.length > 1) {
    for (const react of currMessage.reacts) {
      if (reactId === react.reactId) {
        // Usual unreact
        if (react.uIds.length > 1) {
          react.uIds = react.uIds.filter((item) => {
            return item !== user.uId;
          });
          react.isThisUserReacted = false;
        // Last unreact of that reactId
        } else {
          currMessage.reacts = currMessage.reacts.filter((item) => {
            return item.reactId !== react.reactId;
          });
        }
      }
    }
  }

  return {};
}

// helper function
function editMessage(token: string, id: number, message: string, prop: string) {
  const data = getData();
  if (message.length === 0) {
    messageRemoveV1(token, id);
    return;
  }
  if (prop === 'dms') {
    for (const item of data.dms) {
      for (const msg of item.messages) {
        if (msg.messageId === id) {
          msg.message = message;
        }
      }
    }
  } else if (prop === 'channels') {
    for (const item of data.channels) {
      for (const msg of item.messages) {
        if (msg.messageId === id) {
          msg.message = message;
        }
      }
    }
  }
  setData(data);
}

export { messageSendV1, messageSenddmV1, messageEditV1, messageRemoveV1, messageReactV1, messageUnreactV1 };
