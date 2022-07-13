import { error, errorMsg, getData, setData } from './dataStore';
import {
  checkValidChannel,
  checkValidToken,
  checkValidMessage,
  checkMessageSender,
  // returnValidUser,
  returnValidChannel,
  returnValidMessage,
  getIdfromToken,
  getChannelfromMessage,
  isMember,
  isOwner
} from './helper';

type messageId = { messageId: number };

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
      !checkValidMessage(token, messageId) ||
      !checkMessageSender(token, messageId) ||
      !isOwner(token, getChannelfromMessage(messageId).channelId)) {
    return errorMsg;
  }
  console.log(!checkValidMessage(token, messageId));
  const data = getData();
  if (message.length === 0) {
    messageRemoveV1(token, messageId);
  }
  const messageDetails = returnValidMessage(messageId);
  messageDetails.message = message;
  setData(data);
  return {};
}

function messageRemoveV1(token: string, messageId: number) : object | error {
  // if (!checkValidToken(token)||
  //     !checkValidMessage(token, messageId) ||
  //     !checkMessageSender(token, messageId) ||
  //     !isOwner(token, getChannelfromMessage(messageId).channelId)) {
  //     return errorMsg;
  // }
  // const data = getData();
  // const message = returnValidMessage(messageId);
  // data.channels.messages = data.channels.messages.filter((item) => {
  //     return item != message;
  // })
  // setData(data);
  return {};
}

export { messageSendV1, messageEditV1, messageRemoveV1 };
