import { error, getData, setData, React, Message } from './dataStore';
import { checkValidToken, returnValidUser, checkMessageSource, checkReactId, checkAlreadyReacted } from './helper';
import { notifyReact } from './notifications';
import { checkValidChannelMessage, checkValidDmMessage } from './helper';
import HTTPError from 'http-errors';

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
  if (checkReacts === 2) {
    throw HTTPError(400, 'Message already contains react from authorised user');
  }

  const user = returnValidUser(token);
  const data = getData();

  // Finding current message
  let currMessage: Message;
  let id: number;
  let isChannel = false;
  if (checkMessageSource(messageId) === 0) {
    for (const dm of data.dms) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          currMessage = message;
          id = dm.dmId;
        }
      }
    }
    // Current message is from aChannel
  } else if (checkMessageSource(messageId) === 1) {
    for (const channel of data.channels) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          currMessage = message;
          isChannel = true;
          id = channel.channelId;
        }
      }
    }
  }

  // Another user has already reacted with same reactId
  if (checkReacts === 1) {
    for (const react of currMessage.reacts) {
      if (reactId === react.reactId) {
        react.uIds.push(user.uId);
        setData(data);
        notifyReact(currMessage.uId, user.uId, id, isChannel);
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
      setData(data);
      notifyReact(currMessage.uId, user.uId, id, isChannel);
      // First react of that reactId
    } else {
      currMessage.reacts.push(newReact);
      setData(data);
    }
  }
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

export { messageReactV1, messageUnreactV1 };
