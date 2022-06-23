import {getData, setData} from './dataStore.js';
import {channelsListV1, channelsListallV1} from './channels.js';

function channelDetailsV1(authUserId, channelId) {
    let data = getData();
    // Check if channel is valid
    let validChannel = checkValidChannelId(authUserId, channelId);
    if (validChannel === false) {
        return {error: 'error'};
    }
    // Check if authorised user is member of channel
    const authUserChannelList = channelsListV1(authUserId);
    let authUserValid = false;
    for (let i = 0; i < authUserChannelList.length; i++) {
        if (channelId === authUserChannelList.channelId) {
            authUserValid = true;
            break;
        }
    }
    if (authUserValid === false) {
        return {error: 'error'};
    }
    // All error test passes; return channel details
    for (let channel of data.channels) {
        if (channelId === channel.id) {
            let channelDetail = {
                name: channel.Name,
                isPublic : channel.isPublic,
                ownerMembers: channel.ownerMembers,
                allMembers: channel.allMembers,
            }
            break;
        }
    }
    return {channelDetail};
  }
  
  function channelJoinV1(authUserId, channelId) {
    let data = getData();
    // Check if channel is valid channel 
    let validChannel = checkValidChannelId(authUserId, channelId);
    if (validChannel === false) {
        return {error: 'error'};
    }
    // Check if authUser is a member of channel
    const authUserChannelList = channelsListV1(authUserId);
    let authUserValid = false;
    for (let i = 0; i < authUserChannelList.length; i++) {
        if (channelId === authUserChannelList.channelId) {
            authUserValid = true;
            break;
        }
    }
    if (authUserValid === true) {
        return {error: 'error'};
    }
    // Check if channelId refers to a channel that is private
    // And authUser is not already a channel member and not a global owner. 
    let user;
    for (let person of data.users) {
        if (person.uId === authUserId) {
            user = person;
        }
    }

    const allChannelsList = channelsListallV1(authUserId);
    let memberValid = false;
    let ownerValid = false;
    for (let j = 0; j < allChannelsList.length; j++) {
        if (channelId === allChannelsList[j].channelId) {
            if (allChannelsList[j].isPublic === false) {
                for (let ownerMembers of allChannelsList[j].ownerMembers) {
                    if (ownerMembers === user) {
                        ownerValid = true;
                    }
                }
                for (let allMembers of allChannelsList[j].allMembers) {
                    if (allMembers === user) {
                        memberValid = true;
                    }
                }
            }
        }
    }
    if (!memberValid || !ownerValid) {
        return {error: 'error'};
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

  // Helper Functions
  function checkValidChannelId(authUserId, channelId) {
    // Check if channelId is valid channel
    let channelList = channelsListallV1(authUserId);
    let valid = false;
    for (let i = 0; i < channelList.length; i++) {
        if (channelId === channelList[i].channelId) {
            valid = true;
        }
    }
    if (valid === false) {
        return false;
    }
    return true;
  }

  function channelInviteV1(authUserId, channelId, uId) {
    return {};
  }
  
  function channelMessagesV1(authUserId, channelId, start) {
    return {
      messages: [],
      start: 0,
      end: -1,
    };
  }

  export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
