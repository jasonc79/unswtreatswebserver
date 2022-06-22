import {authLoginV1, authRegisterV1} from './auth';
import {clearV1} from './other';

beforeEach(() => {
    clearV1();
});

describe('Testing authLoginV1', () => {
    test('Email does not exist', () => {
        let incorrectId = authLoginV1('incorrectEmail@gmail.com', 'password');
        expect(incorrectId).toStrictEqual({error: 'error'});
    });
    
    test('Incorrect password', () => {
        let authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        let incorrectId = authLoginV1('email@gmail.com', 'wrongPassword');
        expect(incorrectId).toStrictEqual({error: 'error'});
    });

    test('Correct return', () => {
        let authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        let incorrectId = authLoginV1('email@gmail.com', 'password');
        expect(incorrectId).toStrictEqual(
            expect.objectContaining({
                authUserId: expect.any(Number)
            })
        );
    });
});
