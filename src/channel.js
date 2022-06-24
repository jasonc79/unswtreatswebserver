import {getData, setData} from './dataStore.js';
import {channelsListV1, channelsListallV1} from './channels.js';
import { checkValidChannel, returnValidChannel } from './helper.js'
/*
Given a channel with ID channelId that the authorised user is a member of, provide basic details about the channel.
Arguments:
    authUserId (string) - A unique identifier for the authorised user
    channelId (string) - 
Return Value: 
    Returns {error: error} on invalid channel
    Returns {error: error} on authorised user already a member of channel
    Returns {}
*/
function channelDetailsV1(authUserId, channelId) {
    // Check if channel is valid
    let validChannel = checkValidChannel(channelId);
    if (validChannel === false) {
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
    // All error test passes; return channel details
    /*let channelDetail;
    for (let channelList of authUserChannelList.channels) {
      if (channelId === channelList.channelId) {
        channelDetail = {
          name: channelList.name,
          isPublic : channelList.isPublic,
          ownerMembers: channelList.ownerMembers,
          allMembers: channelList.allMembers,
        }
      }
    }*/
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
    let data = getData();
    // Check if channel is valid channel 
    let validChannel = checkValidChannel(channelId);
    if (validChannel === false) {
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
    let memberValid = false;
    let ownerValid = false;
    for (let channelList of allChannelsList.channels) {
        if (channelId === channelList.channelId) {
            if (channelList.isPublic === false) {
                for (let ownerMembers of channelList.ownerMembers) {
                    if (ownerMembers.uId === authUserId) {
                      ownerValid = true;
                    }
                }
                for (let allMembers of channelList.allMembers) {
                    if (allMembers.uId === authUserId) {
                      memberValid = true;
                    }
                }
                if (!memberValid || !ownerValid) {
                  return {error: 'error'};
                }
            }
        }
    }
    
    // Add user to the selected channel, update channel list in data, append authUser to allMembers array.
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
