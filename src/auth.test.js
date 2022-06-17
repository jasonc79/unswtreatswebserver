import {authRegisterV1} from './auth';
import {clearV1} from './other';

beforeEach(() => {
    clearV1();
});

describe(('Testing authRegisterV1'), () => {
    test('Invalid Email', () => {
        let authUserId = authRegisterV1('invalidEmail', 'password', 'firstname', 'lastname');
        expect(authUserId).toStrictEqual({error: 'error'});
    });
    test('Email already exists', () => {
        let authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        let authUserId2 = authRegisterV1('email@gmail.com', 'password', 'firstname2', 'lastname2');
        expect(authUserId2).toStrictEqual({error: 'error'});
    });

    test('Password is less than 6 characters', () => {
        let authUserId = authRegisterV1('email@gmail.com', 'pw', 'firstname', 'lastname');
        expect(authUserId).toStrictEqual({error: 'error'});
    });

    test('Length of nameFirst is not between 1 and 50 characters inclusive', () => {
        const longName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy'
        let authUserId = authRegisterV1('email@gmail.com', 'password', '', 'lastname');
        let authUserId2 = authRegisterV1('email2@gmail.com', 'password', longName, 'lastname2');
        expect(authUserId).toStrictEqual({error: 'error'});
        expect(authUserId2).toStrictEqual({error: 'error'});
    });
    
    test('Length of nameLast is not between 1 and 50 characters inclusive', () => {
        const longName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy'
        let authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', '');
        let authUserId2 = authRegisterV1('email2@gmail.com', 'password', 'firstname2', longName);
        expect(authUserId).toStrictEqual({error: 'error'});
        expect(authUserId2).toStrictEqual({error: 'error'});
    });

    test('authUserId is returned', () => {
        let authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', '');
        expect(authUserId).toStrictEqual(
            expect.objectContaining({
                authUserId: expect.any(Number)
            })
        );
    });
});

