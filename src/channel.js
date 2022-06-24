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

/** Invites a user with ID uId to join a channel with ID channelId. 
 * Once invited, the user is added to the channel immediately.
 *
 * @param {string} authUserId - The authUserId of the inviter
 * @param {string} channelId  - The channelId of the channel to be joined 
 * @param {string} uID        - The uID of the invitee 
 * @returns {error: 'error'}    when channelId does not refer to a valid channel
 * @returns {error: 'error'}    when uId does not refer to a valid user
 * @returns {error: 'error'}    when uId refers to a user who is already a member of the channel
 * @returns {error: 'error'}    when channelId is valid and the authorised user is not a member of the channel
 * @returns {}  on no error
 * 
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
  const uIdMember = channel.allMembers.includes(uId); 
  const authUserIdMember = channel.allMembers.includes(authUserID); 
  if (uIdMember === true || authUserdMember === false ) {
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
