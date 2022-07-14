import { error, errorMsg, getData, setData } from './dataStore';
import {
  checkValidChannel,
  checkValidToken,
  checkValidMessage,
  checkMessageSender,
  returnValidChannel,
  returnValidMessage,
  getIdfromToken,
  getChannelfromMessage,
  isMember,
  isOwner,
} from './helper';

type messageId = { messageId: number };

/**
 * Hello
 * @param token
 * @param channelId
 * @param message
 * @returns
 */
function messageSendV1(token: string, channelId: number, message: string) : messageId | error {
  if (!checkValidToken(token) || !checkValidChannel(channelId) || !isMember(token, channelId)) {
    return errorMsg;
  }
  if (message.length < 1 || message.length > 1000) {
    return errorMsg;
  }
  const data = getData();
  const channel = returnValidChannel(channelId);
  const newMessage = {
    messageId: Math.floor(Math.random() * Date.now()),
    uId: getIdfromToken(token),
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
  };
  channel.messages.push(newMessage);
  setData(data);

  return { messageId: newMessage.messageId };
}

function messageEditV1(token: string, messageId: number, message: string) : object | error {
  if (message.length > 1000 ||
      !checkValidToken(token) ||
      !checkValidMessage(messageId) ||
      !checkMessageSender(token, messageId)) {
    return errorMsg;
  }
  if (!isOwner(token, getChannelfromMessage(messageId).channelId)) {
    return errorMsg;
  }

  const data = getData();
  if (message.length === 0) {
    messageRemoveV1(token, messageId);
    setData(data);
    return {};
  }
  const messageDetails = returnValidMessage(messageId);
  messageDetails.message = message;
  setData(data);
  return {};
}

function messageRemoveV1(token: string, messageId: number) : object | error {
  //console.log('1');
  //console.log('token =', token);
  // console.log(checkValidToken(token));
  if (!checkValidToken(token) ||
      !checkValidToken(token) ||
      !checkValidMessage(messageId) ||
      !checkMessageSender(token, messageId)) {
    return errorMsg;
  }
  //console.log('2');
  const channel = getChannelfromMessage(messageId);
  // console.log(channel);
  if (!isOwner(token, channel.channelId)) {
    return errorMsg;
  }
  //console.log('3');
  const data = getData();
  const messageDetails = returnValidMessage(messageId);
  channel.messages = channel.messages.filter((item) => {
    return item !== messageDetails;
  });
  setData(data);
  return {};
}

export { messageSendV1, messageEditV1, messageRemoveV1 };
