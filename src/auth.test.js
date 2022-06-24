import {authLoginV1, authRegisterV1} from './auth';
import {clearV1} from './other';
import {userProfileV1} from './users.js';

beforeEach(() => {
    clearV1();
});

describe('Testing authLoginV1', () => {
    test('Email does not exist', () => {
        const incorrectId = authLoginV1('incorrectEmail@gmail.com', 'password');
        expect(incorrectId).toStrictEqual({error: 'error'});
    });
    
    test('Incorrect password', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        const incorrectId = authLoginV1('email@gmail.com', 'wrongPassword');
        expect(incorrectId).toStrictEqual({error: 'error'});
    });

    test('Correct return', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        const correctId = authLoginV1('email@gmail.com', 'password');
        expect(correctId).toStrictEqual(
            expect.objectContaining({
                authUserId: authUserId.authUserId
            })
        )
    })
});

describe(('Testing authRegisterV1'), () => {
    test('Invalid Email', () => {
        const authUserId = authRegisterV1('invalidEmail', 'password', 'firstname', 'lastname');
        const authUserId2 = authRegisterV1('invalidEmail@', 'password', 'firstname2', 'lastname2');
        expect(authUserId).toStrictEqual({error: 'error'});
        expect(authUserId2).toStrictEqual({error: 'error'});
    });
    test('Email already exists', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        const authUserId2 = authRegisterV1('email@gmail.com', 'password', 'firstname2', 'lastname2');
        const authUserId3 = authRegisterV1('EMAIL@gmail.com', 'password', 'firstname2', 'lastname2');
        expect(authUserId2).toStrictEqual({error: 'error'});
        expect(authUserId3).toStrictEqual({error: 'error'});
    });

    test('Password is less than 6 characters', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'pw', 'firstname', 'lastname');
        expect(authUserId).toStrictEqual({error: 'error'});
    });

    test('Length of nameFirst is not between 1 and 50 characters inclusive', () => {
        const longName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy'
        const authUserId = authRegisterV1('email@gmail.com', 'password', '', 'lastname');
        const authUserId2 = authRegisterV1('email2@gmail.com', 'password', longName, 'lastname2');
        expect(authUserId).toStrictEqual({error: 'error'});
        expect(authUserId2).toStrictEqual({error: 'error'});
    });
    
    test('Length of nameLast is not between 1 and 50 characters inclusive', () => {
        const longName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy'
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', '');
        const authUserId2 = authRegisterV1('email2@gmail.com', 'password', 'firstname2', longName);
        expect(authUserId).toStrictEqual({error: 'error'});
        expect(authUserId2).toStrictEqual({error: 'error'});
    });

    test('authUserId is returned', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        expect(authUserId).toStrictEqual(
            expect.objectContaining({
                authUserId: expect.any(Number)
            })
        );
    });

    test('Handle generated is correctly concatenated', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        const user = userProfileV1(authUserId.authUserId, authUserId.authUserId);
        expect(user.user.handleStr).toStrictEqual('firstnamelastname');
    });
});