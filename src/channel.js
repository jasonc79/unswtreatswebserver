import { checkValidChannel, returnValidChannel } from './helper.js'
import { getData } from './dataStore.js'

function channelDetailsV1(authUserId, channelId) {
    return {
      name: 'secret candy crush team', 
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
    if (!currChannel.allMembers.include(authUserId)) {
      return { error: "error" };
    }
    const messages = [];
    let final = start + 50;
    for (let i = start; i < final; i++) {
      if (i >= channelMsg.length) {
        return {
          'messages': messages,
          'start': start,
          'end': -1,
        };
      }
      messages.push(channelMsg[i]);
    }
    return {
      'messages': messages,
      'start': start,
      'end': final,
    };
  }
  
  export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };