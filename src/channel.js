import { checkValidChannel, returnValidChannel } from "./helper.js";
import { getData } from "./dataStore.js";

function channelDetailsV1(authUserId, channelId) {
  return {
    name: "secret candy crush team",
    isPublic: true,
    ownerMembers: [],
    allMembers: [],
  };
}

function channelJoinV1(authUserId, channelId) {
  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  return {};
}

/*
This function checks if authUserId, channelId are valid then starting from start 
returns 50 messages from a specified channel. If there are less than start+50
messages it returns -1 in the "end: " 

Arguments:
    authUserId (number)   - The email inputted by the user
    channelId (number)    - The password inputted by the user
    start(number)         - The index of messages you wish to start from

Return Value:
    Returns {error: 'error'} on invalid authUserId
    Returns {error: 'error'} on invalid channelId
    Returns {error: 'error'} on valid channelId but authUserId is not part of members
    Returns {error: 'error'} on start is greater than ammount of messages in messages
    Returns {messages: messages, start: start, end: -1} when all inputs are valid but 
    there are less than start+50 messages in messages
    Returns {messages: messages, start: start, end: start+50} when all inputs are 
    valid and there are more or start+50 messages in messages 
*/

function channelMessagesV1(authUserId, channelId, start) {
  if (!checkValidId(authUserId)) {
    return { error: "error" };
  }
  const data = getData();
  if (!checkValidChannel(channelId)) {
    return { error: "error" };
  }
  const currChannel = returnValidChannel(channelId);
  let isMember = false;
  for (let member of currChannel.allMembers) {
    if (authUserId === member.uId) {
      isMember = true;
    }
  }
  if (isMember === false) {
    return { error: "error" };
  }
  const channelMsg = currChannel.messages;
  if (channelMsg.length < start) {
    return { error: "error" };
  }
  
  const messages = [];
  let final = start + 50;
  for (let i = start; i < final; i++) {
    if (i >= channelMsg.length) {
      return {
        messages: messages,
        start: start,
        end: -1,
      };
    }
    messages.push(channelMsg[i]);
  }
  return {
    messages: messages,
    start: start,
    end: final,
  };
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
