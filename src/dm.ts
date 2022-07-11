import { getData, setData, error, errorMsg, authUserId, token, uId, Dm, User } from './dataStore';
import { checkValidToken } from './helper';

// Stubbed dm functions
type dmId = string; //number; 
const dmCreateV1 = (token: string, uIds: uId[]): dmId | error => {
    return 'token' + 'uIds'; 
} 

type dmDetails = string;//{ name: string, members: User[] };
const dmDetailsV1 = (token: string, dmId: number): dmDetails | error => {
    return 'token' + 'dmId'; 
}

type dms = string;//{ dms: Dm[] };
const dmListV1 = (token: string): dms | error => {
    return 'token'; 
} 

const dmRemoveV1 = (token: string, dmId: number): {} | error => {
    return 'token' + 'dmId'; 
}

export { dmCreateV1, dmDetailsV1, dmListV1, dmRemoveV1 }; 