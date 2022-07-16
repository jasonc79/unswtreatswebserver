Assumptions:
- Assumed that the user who created the channel is also an owner of the channel
- Assumed case (lower/upper) for nameFirst and nameLast should not be changed when stored in the database
- Assumed the strings nameFirst and nameLast could contain non alphanumeric symbols and these should be removed before being added in the datastore.
- When a user joins a channel, it is assumed that user is just a  member of the channel; that is added to the allMembers array.
- Assumes that all authUserId and channelId in user and channels objects are all unique
- Assume that if authUserId is invalid in all functions it is passed into, it returns {error: ‘error’}

- Assumed that if there are no channels the functions channelsListV1 and channelsListAllV1 will both return empty arrays.
- Assume that the ‘validator’ function is always accurate
- Assumed that authUserId is valid for all tests, but in functions authUserId is tested to see if valid
- Assumed that there is currently no way to add messages to a channel, so messages will always be empty(for now)
- Tests assumed that data is correctly stored in dataStore, so the contents of the dataStore do not need to be tested
- Assume the created channel is added to dataStore in channelsCreateV1