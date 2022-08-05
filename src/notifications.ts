import { getData, User, Notification } from './dataStore';
import { updateUser, checkValidToken, returnValidUser, returnValidChannel, returnValidDm, returnValidId } from './helper';
import { isMemberFromId, isDmMemberFromId } from './helper';
import HTTPError from 'http-errors';

/** NotificationsV1
 *
 * @param {string}  token
 *
 */
export function notificationsV1(token: string) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const authUser = returnValidUser(token);
  let notificationsArray: Notification[] = authUser.notifications;
  const numNotifications = notificationsArray.length;
  // Output the newest 20 messages
  if (numNotifications > 20) {
    const numIgnoredNotifications = numNotifications - 20;
    for (let i = 0; i < numIgnoredNotifications; i++) {
      notificationsArray.shift();
    }
  }

  notificationsArray = notificationsArray.reverse();
  return { notifications: notificationsArray };
}

/** Notify tag
 *  Given a message, identifies which users it tags and notifies the respective
 * users
 * @param {string} token
 * @param {string} message
 * @param {number} channelId
 * @param {number} dmId
 */
export function notifyTag(token: string, message: string, messageId: number, channelId: number, dmId:number) {
  const authUser = returnValidUser(token);
  const handleArray: string[] = extractHandle(message);
  for (const handle of handleArray) {
    let userFromHandle = getUserfromHandle(handle);
    if (userFromHandle !== undefined) {
      if (!isTagged(userFromHandle, messageId)) {
        if (dmId === -1) {
          userFromHandle = tagUserChannel(token, authUser, userFromHandle, message, messageId, channelId);
        } else if (channelId === -1) {
          userFromHandle = tagUserDm(token, authUser, userFromHandle, message, messageId, dmId);
        }
        updateUser(userFromHandle.uId, userFromHandle);
      }
    }
  }
}

function getUserfromHandle(handleStr: string): User | undefined {
  const data = getData();
  const user = data.users.find((user: User) => user.handleStr === handleStr);
  return user;
}

function tagUserChannel(token: string, authUser: User, user: User, message: string, messageId: number, channelId: number): User {
  if (isMemberFromId(user.uId, channelId)) {
    const channel = returnValidChannel(channelId);
    const notificationMessage = `${authUser.handleStr} tagged you in ${channel.name}: ${message.slice(0, 20)}`;
    const newNotification = createNotification(channelId, -1, notificationMessage);
    user.notifications.push(newNotification);
    user.messagesTagged.push(messageId);
  }
  return user;
}

function tagUserDm(token: string, authUser: User, user: User, message: string, messageId: number, dmId:number): User {
  if (isDmMemberFromId(user.uId, dmId)) {
    const dm = returnValidDm(dmId);
    const notificationMessage = `${authUser.handleStr} tagged you in ${dm.name}: ${message.slice(0, 20)}`;
    const newNotification = createNotification(-1, dmId, notificationMessage);
    user.notifications.push(newNotification);
    user.messagesTagged.push(messageId);
  }
  return user;
}
function isTagged(user: User, messageId: number) {
  return user.messagesTagged.includes(messageId);
}

/** notifyUserInvite
 * Notify the user when they are added to a channel or dm
 * @param {string} token
 * @param {number} uId
 * @param {number} channelId    -1 or channelId
 * @param {number} dmId         -1 or dmId
 */
export function notifyUserInvite(token: string, uId: number, channelId: number, dmId: number) {
  const authUser = returnValidUser(token);
  const user = returnValidId(uId);
  let notification: Notification;
  // Create a notification for channel invite
  if (dmId === -1) {
    const channel = returnValidChannel(channelId);
    const notificationMessage = `${authUser.handleStr} added you to ${channel.name}`;
    notification = createNotification(channel.channelId, -1, notificationMessage);
  } else if (channelId === -1) {
  // Create a notification for dm invite
    const dm = returnValidDm(dmId);
    const notificationMessage = `${authUser.handleStr} added you to ${dm.name}`;
    notification = createNotification(-1, dmId, notificationMessage);
  }

  user.notifications.push(notification);
  updateUser(uId, user);
}
/** notifyReact
 * @param {number} authUserId   // The person receiving the react
 * @param {number} uId
 * @param {number} id           // The channel or dm id
 * @param {boolean} isChannel   // true for channel, false for dm
 */
export function notifyReact(authUserId: number, uId: number, id: number, isChannel: boolean) {
  const authUser = returnValidId(authUserId);
  const user = returnValidId(uId);
  let notification: Notification;
  // Create a notification for a react in a channel
  if (isChannel) {
    const channel = returnValidChannel(id);
    if (isMemberFromId(authUserId, id)) {
      const notificationMessage = `${user.handleStr} reacted to your message in ${channel.name}`;
      notification = createNotification(id, -1, notificationMessage);
      authUser.notifications.push(notification);
    }
  } else if (isDmMemberFromId(authUserId, id)) {
  // Create a notification for a react in a dm
    const dm = returnValidDm(id);
    const notificationMessage = `${user.handleStr} reacted to your message in ${dm.name}`;
    notification = createNotification(-1, id, notificationMessage);
    authUser.notifications.push(notification);
  }
  updateUser(authUserId, authUser);
}

function createNotification(channelId: number, dmId: number, notificationMessage: string) : Notification {
  const notification: Notification = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: notificationMessage
  };
  return notification;
}

function extractHandle(message: string) : string[] {
  let newArray: string[] = message.split(/[^a-zA-Z0-9@]/);
  newArray = newArray.filter((string) => string.includes('@'));
  const handleArray: string[] = [];
  newArray.forEach((string) => {
    if (string.includes('@')) {
      const index = string.indexOf('@');
      string = string.substring(index + 1);
    }
    const newString = string.split('@');
    for (const s of newString) {
      handleArray.push(s);
    }
  });
  return handleArray;
}
