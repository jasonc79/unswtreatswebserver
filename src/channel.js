import {getData, setData} from './dataStore.js';

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
    // Checking if channelID and uId are valid
    let data = getData(); 
    const channel = data.channels.find(c => c.channelId === channelId); 
    const user = data.users.find(u => u.uId === uId); 
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
  
  function channelMessagesV1(authUserId, channelId, start) {
    return {
      messages: [],
      start: 0,
      end: -1,
    };
  }
  
  export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };