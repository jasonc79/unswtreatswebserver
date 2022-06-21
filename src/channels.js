function channelsCreateV1(authUserId, name, isPublic) {
    if (name.length < 1 || name.length > 20) {
        return { error: 'error' };
    }
    const channelId = Math.floor(1000 + Math.random() * 9000);
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

console.log(channelsCreateV1(10, 'name', true));
