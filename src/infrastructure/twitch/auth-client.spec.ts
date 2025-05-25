import { TwitchAuthClient } from './auth-client';

describe('TwitchAuthClient', () => {
  describe('requestAppToken', () => {
    it('should return a valid access token and expiresIn', async () => {
      process.env.TWITCH_CLIENT_ID = 'valid-client-id';
      process.env.TWITCH_CLIENT_SECRET = 'valid-client-secret';

      const client = new TwitchAuthClient();
      const result = await client.requestAppToken();

      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        expiresIn: 3600
      });
    });

    it('should throw an error if the response is not 200', async () => {
      process.env.TWITCH_CLIENT_ID = 'invalid-client-id';
      process.env.TWITCH_CLIENT_SECRET = 'invalid-client-secret';

      const client = new TwitchAuthClient();

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Bad Request' })
      } as Response);

      await expect(client.requestAppToken()).rejects.toThrow(
        'Failed to fetch app token: Bad Request'
      );
    });
  });
});
