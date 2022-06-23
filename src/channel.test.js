import { channelMessagesV1 } from './channel.js';

// return type { messages, start, end }
// channelId does not refer to a valid channel, start is greater than the total number of messages in the channel, 
// channelId is valid and the authorised user is not a member of the channel

describe('Pass scenarios', () => {
    test('Has enough messages', () => {
        const id = authRegisterV1(
            "hayden@gmail.com",
            "hayden123",
            "Hayden",
            "Smith"
        );
      
        const channelId = channelsCreateV1(id, "Hayden", true);

        expect(channelMessagesV1(id, channelId, 3)).toEqual([messages], 3, 53)
    })
    test('Not enough messages', () => {
        expect(channelMessagesV1(id, channelId, 3)).toEqual([messages], 3, -1)
    })
})

describe('Fail scenarios', () => {
    test('Channel doesnt not exist', () => {
        const id = authRegisterV1(
            "hayden@gmail.com",
            "hayden123",
            "Hayden",
            "Smith"
        );
        const channelId = channelsCreateV1(id, "Hayden", true);

        expect(channelMessagesV1(id, channelId2, 5)).toEqual({error: 'error'})
    })
    test('No access to channel', () => {
        const id = authRegisterV1(
            "hayden@gmail.com",
            "hayden123",
            "Hayden",
            "Smith"
          );
        const channelId = channelsCreateV1(id, "Hayden", false);
        expect(channelMessagesV1("2", 1, 0)).toEqual({error: 'error'})
    })

    test('Channel doesnt have enough messages', () => {
        const id = authRegisterV1(
            "hayden@gmail.com",
            "hayden123",
            "Hayden",
            "Smith"
          );
        const channelId = channelsCreateV1(id, "Hayden", false);
        expect(channelMessagesV1("2", 2, 10)).toEqual({error: 'error'})
    })
})