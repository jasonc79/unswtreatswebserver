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
This function starting from start returns 50 messages from a specified channel
*/
function channelMessagesV1(authUserId, channelId, start) {
  const data = getData();
  if (!checkValidChannel(channelId)) {
    return { error: "error" };
  }
  const currChannel = returnValidChannel(channelId);
  const channelMsg = currChannel.messages;
  if (channelMsg.length < start) {
    return { error: "error" };
  }
  let isMember = false;
  for (let member of currChannel.allMembers) {
    if (authUserId === member.uId) {
      isMember = true;
    }
  }
  if (isMember === false) {
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
