import {getData, setData} from './dataStore.js';
import { checkValidId, checkValidChannel, returnValidId, returnValidChannel } from "./helper.js";

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

/*
Invites a user with ID uId to join a channel with ID channelId. 
Once invited, the user is added to the channel immediately.

Arguments:
    authUserId (number)         - A unique identifier for the authorised user 
    channelId (number)          - A unique identifier for the channel
    uId (uId)                   - The user's first name, with non-alphanumeric characters

Return Value:
    Returns {error: 'error'}    when uId does not refer to a valid user
    Returns {error: 'error'}    when uId refers to a user who is already a member of the channel
    Returns {error: 'error'}    when channelId is valid and the authorised user is not a member of the channel
    Returns {} on no error
 */
function channelInviteV1(authUserId, channelId, uId) {
  // Checking if channelID and uId are valid
  let data = getData(); 
  const channel = returnValidChannel(channelId); 
  const user = returnValidId(uId); 
  if (channel === undefined || user === undefined) {
    return { error: 'error' };
  }

  // Checking if uId and authUserID are already members
  let uIdMember = false; 
  let authUserIdMember = false; 
  for (let member of channel.allMembers) {
    if (member.uID === uID) {
      uIdMember = true; 
    } else if (member.uID === authUserID) {
      authUserIdMember = true; 
    }
  }
  if (uIdMember === true || authUserIdMember === false ) {
    return { error: 'error' };
  }

  channel.allMembers.push(user); 
  setData(data); 
  return {};
}

/*
This function starting from start returns 50 messages from a specified channel
*/
function channelMessagesV1(authUserId, channelId, start) {
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
