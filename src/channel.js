import {getData, setData} from './dataStore.js';
import {channelsListV1, channelsListallV1} from './channels.js';
import { checkValidChannel, returnValidChannel, returnValidId } from './helper.js';
/*
ChannelDetailsV1 Function
Given a channel with ID channelId that the authorised user is a member of, provide basic details about the channel.
Arguments:
    authUserId (number) - A unique identifier for the authorised user
    channelId (number) - A unique identifier for the channel 
Return Value: 
    Returns {error: 'error'} on invalid channel
    Returns {error: 'error'} if authorised user is not already a member of channel
    Returns {name, isPublic, ownerMembers, allMembers} on no error

ChannelJoinV1 Function
Given a channelId of a channel that the authorised user can join, adds them to that channel.
Arguments:
    authUserId (number) - A unique identifier for the authorised user
    channelId (number) - A unique identifier for the channel 
Return Value: 
    Returns {error: 'error'} on invalid channel
    Returns {error: 'error'} if authorised user is already a member of channel
    Returns {error: 'error'} on a private channel and auth user is not a global owner
    Returns {} on no error
*/
function channelDetailsV1(authUserId, channelId) {
    // Check if channelId and authUserId is valid
    if (!checkValidId(authUserId) || !checkValidChannel(channelId)) {
      return {error: 'error'};
    }
    // Check if authorised user is member of channel
    const authUserChannelList = channelsListV1(authUserId);
    let authUserValid = false;
    for (let channelList of authUserChannelList.channels) {
      if (channelId === channelList.channelId) {
        authUserValid = true;
      }
    }
    if (authUserValid === false) {
      return {error: 'error'};
    }
    let channel = returnValidChannel(channelId);
    let channelDetail = {
      name: channel.name,
      isPublic: channel.isPublic,
      ownerMembers: channel.ownerMembers,
      allMembers: channel.allMembers
    }
    return channelDetail;
  }
  function channelJoinV1(authUserId, channelId) {
    // Check if channelId and authUserId is valid
    if (!checkValidId(authUserId) || !checkValidChannel(channelId)) {
      return {error: 'error'};
    }
    // Check if authUser is a member of channel
    const authUserChannelList = channelsListV1(authUserId);
    let authUserValid = false;
    for (let channelList of authUserChannelList.channels) {
        if (channelId === channelList.channelId) {
          authUserValid = true;
          break;
        }
    }
    if (authUserValid === true) {
        return {error: 'error'};
    }
    // Check if channelId refers to a channel that is private
    // And authUser is not already a channel member and not a global owner. 
    const allChannelsList = channelsListallV1(authUserId);
    let user = returnValidId(authUserId);
    let channel = returnValidChannel(channelId);
    if (channel.isPublic === false && user.permissionId === 2) {
      return {error: 'error'};
    }
    // Add user to the selected channel, update channel list in data, append authUser to allMembers array.
    let data = getData();
    for (let channel of data.channels) {
        if (channelId === channel.channelId) {
            channel.allMembers.push(user);
            setData(data);
            break;
        }
    }
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