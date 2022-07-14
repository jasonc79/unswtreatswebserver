import { error, errorMsg, getData, setData } from './dataStore';
import {
  checkValidChannel,
  checkValidToken,
  // checkValidMessage,
  // checkMessageSender,
  returnValidChannel,
  // returnValidMessage,
  getIdfromToken,
  // getChannelfromMessage,
  isMember,
  // isOwner,
} from './helper';

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
  // if (message.length > 1000 ||
  //     !checkValidToken(token) ||
  //     !checkValidMessage(messageId) ||
  //     !checkMessageSender(token, messageId)) {
  //   return errorMsg;
  // }
  // if (!isOwner(token, getChannelfromMessage(messageId).channelId)) {
  //   return errorMsg;
  // }

  // const data = getData();
  // if (message.length === 0) {
  //   messageRemoveV1(token, messageId);
  //   setData(data);
  //   return {};
  // }
  // const messageDetails = returnValidMessage(messageId);
  // messageDetails.message = message;
  // setData(data);
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
  // if (!checkValidToken(token) ||
  //     !checkValidMessage(messageId) ||
  //     !checkMessageSender(token, messageId)) {
  //   return errorMsg;
  // }
  // const channel = getChannelfromMessage(messageId);
  // if (!isOwner(token, channel.channelId)) {
  //   return errorMsg;
  // }
  // const data = getData();
  // const messageDetails = returnValidMessage(messageId);
  // channel.messages = channel.messages.filter((item) => {
  //   return item !== messageDetails;
  // });
  // setData(data);
  return {};
}

export { messageSendV1, messageEditV1, messageRemoveV1 };
