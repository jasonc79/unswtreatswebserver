/**
 * ChannelDetailsV2
 * Given a channel with ID channelId that the authorised user is a member of, provide basic details about the channel.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Invalid channelId
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - Authorisd user is not a member of the channel
 * Returns:
 * @returns { channelDetails } if there is no error
 */

/**
 * channelJoinV1
 * Adds the current user to the channel
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel beign accessed
 *
 * Error throwing:
 *  @throws { HTTPError(400) }
 *    - On channelId does not refer to a valid channel
 *    - On the authorised user is already a member of the channel
 * @throws { HTTPError(403) }
 *    - On invalid token
 *    - On channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner
 * Return Values:
 * @returns {} if there is no error
 */

/**
 * channelInviteV3
 * Invites a user with ID uId to join a channel with ID channelId.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 * @param {number} uId the id of the user who wants to join the channel
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Invalid channelId
 *    - Invalid userId
 *    - User is already a member of the channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - Authorisd user is not a member of the channel
 * Returns:
 * @returns {} if there is no error
 */

/**
 * channelMessagesV2
 * Given a channel with ID channelId that the authorised user is a member of, return up to 50 messages
 * between index "start" and "start + 50".
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 * @param {number} start where messages will start printing from
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Invalid channelId
 *    - start is greater than the total number of messages in the channel
 *    - User is already a member of the channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - Authorisd user is not a member of the channel
 * Returns:
 * @returns { messagesUnder50 } if there is no error and if less than 50 messages
 * @returns { messagesOver50 } if there is no error and there is 50 messages
 */

/**
 * channelLeaveV1
 * Given a channel with ID channelId that the authorised user is a member of, remove them as a member of the channel.
 *
 * Arguments
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Invalid channelId
 *    - the authorised user is the starter of an active standup in the channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - ChannelId is valid and the authorised user is not a member of the channel
 * Returns:
 * @returns { object } on no error
 */

/**
 * channelAddOwnerV1
 * Make user with user id uId an owner of the channel.
 *
 * Arguments
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 * @param {number} uId the user to become owner
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - channelId does not refer to a valid channel
 *    - uId does not refer to a valid user
 *    - uId refers to a user who is already an owner of the channel
 *    - uId refers to a user who is not a member of the channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - channelId is valid and the authorised user does not have owner permissions in the channel
 * Returns:
 * @returns { object } when no error
 */

/**
 * channelRemoveOwnerV1
 * Remove user with user id uId as an owner of the channel.
 *
 * Arguments
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 * @param {number} uId the user to remove owner
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - channelId does not refer to a valid channel
 *    - uId does not refer to a valid user
 *    - uId refers to a user who is not an owner of the channel
 *    - uId refers to a user who is currently the only owner of the channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - channelId is valid and the authorised user does not have owner permissions in the channel
 * Returns:
 * @returns { object } when no error
 */

/**
 * adminRemoveV1
 * Given a user by their uId, remove them from the Treats. This means
 * they should be removed from all channels/DMs, and will not be
 * included in the array of users returned by users/all. Treats
 * owners can remove other Treats owners (including the original first
 * owner). Once users are removed, the contents of the messages
 * they sent will be replaced by 'Removed user'. Their profile must
 * still be retrievable with user/profile, however nameFirst should
 * be 'Removed' and nameLast should be 'user'. The user's email and
 * handle should be reusable.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} uId is the id of the user
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Invalid channelId
 *    - uId does not refer to a valid user
 *    - uId refers to a user who is the only global owner
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - the authorised user is not a global owner
 * Returns:
 * @returns {} if pass with no errors
 */

/**
 * adminPermissionChangeV1
 * Given a user by their user ID, set their permissions to new
 * permissions described by permissionId.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} uId is the id of the user
 * @param {number} permissionId is the permission of the user
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Invalid channelId
 *    - uId does not refer to a valid user
 *    - uId refers to a user who is the only global owner and they are being demoted to a user
 *    - permissionId is invalid
 *    - the user already has the permissions level of permissionId
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - the authorised user is not a global owner
 * Returns:
 * @returns {} if pass with no errors
 */

/**
 * messageSendV1
 * Sends a message to a specified channel
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel beign accessed
 * @param {string} message is the message the user wants to send
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Invalid channelId
 *    - Channel ID does not refer to a valid channel
 *    - Length of message must be 1-1000 inclusive
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - The authorised user is not a member of the channel
 * Returns:
 * @returns { messageId: messageId } if a message is sent without any errors
 */

/**
 * messageSenddmV1
 * Send a message from authorisedUser to the DM specified by dmId.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} dmId is the id of the dm beign accessed
 * @param {string} message is the message the user wants to send
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Dm ID does not refer to a valid dm
 *    - Length of message must be 1-1000 inclusive
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - The authorised user is not a member of the dm
 * Returns:
 * @returns { messageId: messageId } if a message is sent without any errors
 */

/**
 * messageEditV1
 * If the user matches the person who sent the message and the message is valid,
 * updates and edits the message
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} messageId is the id of the message beign accessed
 * @param {string} message is the new message the user wants to change to
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Length of message must be less than 1000 inclusive
 *    - Message ID does not refer to a valid message
 *    - The authorised user is not a member of the dm
 *    - The authorised user is not a member of the channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - The authorised user is not a member of the dm
 *    - User is not an owner of the dm
 *    - User is not an owner of the channel
 * Returns:
 * @returns {} if pass with no errors
 */

/**
 * messageRemoveV1
 * Removes a message given the message's id
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} messageId is the id of the message beign accessed
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Message ID does not refer to a valid message
 *    - The authorised user is not a member of the dm
 *    - The authorised user is not a member of the channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - The authorised user is not a member of the dm
 *    - User is not an owner of the dm
 *    - User is not an owner of the channel
 * Returns:
 * @returns {} if message is removed with no errors
 */

/**
 * messageSendlaterV1
 * Send a message from the authorised user to the channel specified by channelId
 * automatically at a specified time in the future
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel beign accessed
 * @param {string} message is the message the user wants to send
 * @param {number} timeSent is the time that the message should be sent
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Channel ID does not refer to a valid channel
 *    - timeSent is a time in the past
 *    - Length of message must be 1-1000 inclusive
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - The authorised user is not a member of the channel
 * Returns:
 * @returns { messageId: msgId } if a message is set to be sent without any errors
 */

/**
 * messageSendlaterdmV1
 * Send a message from the authorised user to the dm specified by dmId
 * automatically at a specified time in the future
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} dmId is the id of the dm beign accessed
 * @param {string} message is the message the user wants to send
 * @param {number} timeSent is the time that the message should be sent
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Dm ID does not refer to a valid dm
 *    - timeSent is a time in the past
 *    - Length of message must be 1-1000 inclusive
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - The authorised user is not a member of the channel
 * Returns:
 * @returns { messageId: msgId } if a message is set to be sent without any errors
 */

/**
 * messageShareV1
 * A new message containing the contents of both the original message and the optional
 * message should be sent to the channel/DM identified by the channelId/dmId.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel beign accessed
 * @param {number} dmId is the id of the dm beign accessed
 * @param {string} ogMessageId is the original messageId the user wants to share
 * @param {string} message is the additional message the user wants to send
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Channel ID does not refer to a valid channel
 *    - Neither dmId or channelId is -1
 *    - Length of message must be less than 1000 inclusive
 *    - ogMessageId does not refer to valid channel or channel that the authorised user has joined
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - Authorised user is not a member of the channel they are sharing a message to
 *    - Authorised user is not a member of the dm they are sharing a message to
 * Returns:
 * @returns { sharedMessageId: newMessageId } if a message is shared without any errors
 */

/**
 * messagePinV1
 * Given a message within a channel or DM, mark it as "pinned".
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} messageId is the id of the message beign accessed
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - messageId is not a valid message within a channel or DM that the authorised user has joined
 *    - the message is already pinned
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - messageId refers to a valid message in a joined channel and the authorised user does not have owner permissions in the channel
 *    - messageId refers to a valid message in a joined DM and the authorised user does not have owner permissions in the DM
 * Returns:
 * @returns {} if message is pinned with no errors
 */

/**
 * messageUnpinV1
 * Given a message within a channel or DM, remove its mark as "pinned".
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} messageId is the id of the message beign accessed
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - messageId is not a valid message within a channel or DM that the authorised user has joined
 *    - the message is not already pinned
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - messageId refers to a valid message in a joined channel and the authorised user does not have owner permissions in the channel
 *    - messageId refers to a valid message in a joined DM and the authorised user does not have owner permissions in the DM
 * Returns:
 * @returns {} if message is removed pinned with no errors
 */

/**
 * searchV1
 * Given a query string, return a collection of messages in all of the
 * channels/DMs that the user has joined that contain the query
 * (case-insensitive). There is no expected order for these messages.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} queryStr is the queryStr that is used to search through each message
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Length of queryStr is less than 1 character long
 *    - Length of queryStr is more than 1000 characters long
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns { messages } if pass with no errors
 */

/**
 * userProfileV3
 * For a valid user, returns information about their userId, email, first name, last name, and handle
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} uId the id of the user that's details are being searched for
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - uId does not refer to a valid user
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns { user } if there is no error
 */

/**
 * userSetNameV2
 * Update the authorised user's first and last name
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} nameFirst The first name of the user
 * @param {string} nameLast The last name of the user
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - length of nameFirst is not between 1 and 50 characters inclusive
 *    - length of nameLast is not between 1 and 50 characters inclusive
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns {} if there is no error
 */

/**
 * userSetEmailV2
 * Update the authorised user's email address
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} email the email of the user
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - email entered is not a valid email
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns {} if there is no error
 */

/**
 * userSetHandleV2
 * Update the authorised user's handle (i.e. display name)
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} handleStr the handle string of the user
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - length of handleStr is not between 3 and 20 characters inclusive
 *    - handleStr contains characters that are not alphanumeric
 *    - the handle is already used by another user
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns {} if there is no error
 */

/**
 * usersAllV2
 * Returns an array of all users and their associated details.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 *
 * Error throwing:
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns { users: userDetails } if there is no error
 */

/**
 * usersStatsV1
 * Fetch the required statistics about the workspace's use of UNSW Treats.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 *
 * Error throwing:
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns {returnWorkspaceStats} if there is no error
 */

/**
 * userStatsV1
 * Fetch the required statistics about this user's use of UNSW Treats.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 *
 * Error throwing:
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns {returnUserStats} if there is no error
 */

/**
 * channelsCreateV1
 * Creates a new channel with the given name that is either a public or private channel.
 * The user who created it automatically joins the channel.
 *
 * Arguments
 * @param token tells the server who is currently accessing it
 * @param name contains the string which is set to be the channel name
 * @param isPublic value determining if the channel will be private or public
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Length of name must be 1-20 inclusive
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns { channelId } when no error
 */

/**
 * channelsListV1
 * Provide an array of all channels (and their associated details) that the authorised user is part of.
 *
 * Arguments
 * @param token tells the server who is currently accessing it
 *
 * Error throwing:
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns { channelsList } when no error
 */

/**
 * channelsListallV1
 * Provide an array of all channels, including private channels, (and their associated details)
 *
 * Arguments
 * @param token tells the server who is currently accessing it
 *
 * Error throwing:
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns { channelsList } when no errors
 */

/**
 * dmCreateV2
 *
 * Creates a DM where uIds contains the user(s) that this DM is directed to.
 * The user with the token is the owner of the DM.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 * @param {number[]} uIds is an array of user's uIds, not including the creator of the DM
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - uId does not refer to a valid user
 *    - Duplicate uIds
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns { dmId } on no error
 */

/**
 * dmDetailsV2
 *
 * Given a DM with ID dmId that the authorised user is a member of,
 * provide basic details about the DM.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 * @param {number} dmId is a unique identifier for a DM
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - dmId is invalid
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - Authorised user is not a member of the DM
 * Returns:
 * @returns { name, members } on no error
 */

/**
 * dmRemoveV2
 *
 * Remove an existing DM, so all members are no longer in the DM.
 * This can only be done by the original creator of the DM.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 * @param {number} dmId is a unique identifier for a DM
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - dmId is invalid
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - Authorised user is not the original DM creator
 *    - Authorised user is no longer in the DM
 * Returns:
 * @returns { } on no error
 */

/**
 * dmLeaveV2
 *
 * Given a DM ID, the user is removed as a member of this DM
 * The creator is allowed to leave and the DM will still exist if this happens.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 * @param {number} dmId is a unique identifier for a DM
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - dmId is invalid
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - Authorised user is not a member of the DM
 * Returns:
 * @returns { } on no error
 */

/**
 * dmMessagesV1
 * Given a DM with ID dmId that the authorised user is a member of,
 * return up to 50 messages between index "start" and "start + 50".
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} dmId is the id of the dm being accessed
 * @param {number} start where messages will start printing from
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - dmlId does not refer to a valid DM
 *    - start is greater than the total number of messages in the channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - dmId is valid and the authorised user is not a member of the DM
 * Returns:
 * @returns { messagesUnder50 } if there is no error and if less than 50 messages
 * @returns { messagesOver50 } if there is no error and there is 50 messages
 */

/**
 * authRegisterV1
 * Given a user's first and last name, email address, and password, create a new account for
 * them and return a new `authUserId`.
 *
 * Arguments
 * @param email The email adress of the user registering
 * @param password The password of the user registering
 * @param nameFirst The user's first name, with non-alphanumeric characters
 * @param nameLast The user's last name, with non-alphanumeric characters
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Length of name is not between 1 and 50 characters inclusive
 *    - Password length is less than 6 characters
 *    - Email is not valid, or is already being used
 * Returns:
 * @returns { authUserId } when no error
 */

/**
 * authLoginV1
 * This function checks if the user's email and password is valid and returns their authUserId to login
 *
 * Arguments:
 * @param email The email inputted by the user
 * @param password The password inputted by the user
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Email does not belong to a user
 *    - Password is not correct
 * @returns { authUserId } on no error
 */

/**
 * authLogoutV1
 * Given an active token, invalidates the token to log the user out.
 *
 * Arguments:
 * @param token tells the server who is currently accessing it
 *
 * Error throwing:
 * @throws { HttpError(403) }
 *    - Invalid token
 * Returns:
 * @returns { object } when no error
 */

/**
 * authPasswordRequest
 * Given an email address, if the email address belongs to a
 * registered user, send them an email containing a secret password reset code.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} email the email being accessed
 *
 * Return values:
 * @returns { empty } when no error
 */

/**
 * authPasswordReset
 * Given a reset code for a user, set that user's new password to the password provided.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} resetCode the secret code needed to change password
 * @param {string} newPassword the new password
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Reset code is not a valid reset code
 *    - Length of new password is not less than 6 characters
 * Returns:
 * @returns { empty } when no error
 */

/**
 * standupStartV1
 * For a given channel, start a standup period lasting length seconds.
 *
 * Arguments
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId the channelId of the channel to start a standup
 * @param {number} length duration of the standup in seconds
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Channel ID does not refer to a valid channel
 *    - Length cannot be a negative number
 *    - There is already an active standup in this channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - The authorised user is not a member of the channel
 * Returns:
 * @returns { timeFinish: finish } when no error
 */


/**
 * standupActiveV1
 * For a given channel, return whether a standup is active in it, and what time the standup finishes.
 *
 * Arguments
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId the channelId of the channel to start a standup
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Channel ID does not refer to a valid channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - The authorised user is not a member of the channel
 * Returns:
 * @returns { activeReturn } when no error
 */

/**
 * standupSendV1
 * For a given channel, if a standup is currently active in the channel, send a message to
 * get buffered in the standup queue.
 *
 * Arguments
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId the channelId of the channel to start a standup
 * @param {string} message the message to be sent to standup
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Channel ID does not refer to a valid channel
 *    - The length of the message is over 1000 characters
 *    - An active standup is not currently running in the channel
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - The authorised user is not a member of the channel
 * Returns:
 * @returns {} when no error
 */
