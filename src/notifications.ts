import { getData, User, Notification, userReturn } from './dataStore';
import { updateUser, checkValidToken, returnValidUser, returnValidChannel, returnValidDm, returnValidId, getIdfromToken } from './helper';
import { userProfileV3 } from './users';
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
export function notifyTag(token: string, message: string, channelId: number, dmId:number ) {
    const authUser = returnValidUser(token);
    const {user} = userProfileV3(token, authUser.uId) as userReturn;
    

    
    let handleArray = extractHandle(message);
    
    for (const handle of handleArray) {
        let userFromHandle = getUserfromHandle(handle);
        if (userFromHandle !== undefined) {
            // Notify when tagged in a channel
            if (dmId === -1) {
                const channel = returnValidChannel(channelId);
                const notificationMessage = `${user.handleStr} tagged you in ${channel.name}: ${message.slice(0,20)}`;
                const newNotification = createNotification(channelId, -1, notificationMessage);
                userFromHandle.notifications.push(newNotification);
            } else if (channelId === -1) {
                const dm = returnValidDm(dmId);
                const notificationMessage = `${user.handleStr} tagged you in ${dm.name}: ${message.slice(0,20)}`;
                const newNotification = createNotification(-1, dmId, notificationMessage);
                userFromHandle.notifications.push(newNotification);
            }
            updateUser(userFromHandle.uId, userFromHandle);
            // Notify when tagged in a dm
        }
    }
}

function getUserfromHandle(handleStr: string): User | undefined{
    let data = getData();
    let user = data.users.find((user: User) => user.handleStr === handleStr);
    return user;
}


/**notifyUserInvite
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
  } else if (channelId === -1 ) {
  // Create a notification for dm invite
    const dm = returnValidDm(dmId);
    const notificationMessage = `${authUser.handleStr} added you to ${dm.name}`;
    notification = createNotification(-1, dmId, notificationMessage);
  }
 
  user.notifications.push(notification);
  updateUser(uId, user);
}

export function notifyReact() {

}

function createNotification(channelId: number, dmId: number, notificationMessage) : Notification {
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
    let handleArray = [];
    newArray.forEach((string) => {
      if(string.includes('@')) {
        let index = string.indexOf('@');
        string = string.substring(index + 1);
      }
      let newString = string.split('@');
      for (let s of newString) {
        handleArray.push(s);
      }
    });
    return handleArray;
  }
  
  