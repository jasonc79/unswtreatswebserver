import { getData, setData } from './dataStore.js'

function channelsCreateV1(authUserId, name, isPublic) {
    if (name.length < 1 || name.length > 20) {
        return { error: 'error' };
    }
    const channelId = Math.floor(1000 + Math.random() * 9000);
    let newChannel = {
        channelId: channelId,
        name: name,
        allMembers: [authUserId.authUserId],
        staffMembers: [authUserId.authUserId],
        isPublic: isPublic,
    }

    let data = getData();
    let channels = data.channels;

    channels.push(newChannel)
    //console.log(channels);

    setData(channels);

    return {
        channelId: channelId,
    };
}

function channelsListV1(authUserId) {
    return {
        channels: [] // see interface for contents
    };
}
  
function channelsListallV1(authUserId) {
    return {
        channels: [] // see interface for contents
    };
}
  
export { channelsCreateV1, channelsListV1, channelsListallV1 };