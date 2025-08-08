import { TwitchTokenService } from './twitch-token-service';
import { TwitchRepository } from '@repositories/twitch-repository';

describe('TwitchTokenService', () => {
  let service: TwitchTokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TwitchTokenService();
    // @ts-ignore
    service.clientId = 'test-client-id';
    // @ts-ignore
    service.clientSecret = 'test-client-secret';
  });

  describe('getToken', () => {
    it('should return cached token if not expired', async () => {
      const mockToken = 'access-token';
      const future = Date.now() + 3600000; // 1 hour in the future

      const getAppTokenSpy = jest.spyOn(TwitchRepository, 'getAppToken');
      getAppTokenSpy.mockResolvedValue({
        accessToken: mockToken,
        expiresAt: new Date(future).toISOString()
      });

      const saveAppTokenSpy = jest.spyOn(TwitchRepository, 'saveAppToken');

      const token = await service.getToken();
      expect(saveAppTokenSpy).not.toHaveBeenCalled();

      expect(token).toBe(mockToken);
      expect(getAppTokenSpy).toHaveBeenCalled();
    });

    it('should fetch new token if expired and save it', async () => {
      const expired = Date.now() - 10000;
      const future = Date.now() + 3600000; // 1 hour in the future

      const getAppTokenSpy = jest.spyOn(TwitchRepository, 'getAppToken');
      getAppTokenSpy.mockResolvedValue({
        accessToken: 'cached-token',
        expiresAt: new Date(expired).toISOString()
      });

      jest.spyOn(service, 'getNewAccessToken').mockResolvedValue({
        token: 'new-access-token',
        expiresIn: 3600,
        bearerType: 'bearer'
      });

      const saveAppTokenSpy = jest.spyOn(TwitchRepository, 'saveAppToken');

      const token = await service.getToken();
      expect(token).toBe('new-access-token');
      expect(service.getNewAccessToken).toHaveBeenCalled();
      expect(saveAppTokenSpy).toHaveBeenCalledWith(
        'new-access-token',
        expect.any(String)
      );
    });
  });

  describe('getNewAccessToken', () => {
    it('should return token data on success', async () => {
      const result = await service.getNewAccessToken();
      expect(result).toEqual({
        token: 'mock-access-token',
        expiresIn: 3600,
        bearerType: 'bearer'
      });
    });

    it('should throw error if fetch fails', async () => {
      // Mock global fetch to throw an error
      global.fetch = jest
        .fn()
        .mockRejectedValue(
          new Error('Failed to fetch access token from Twitch API')
        );

      await expect(service.getNewAccessToken()).rejects.toThrow(
        'Failed to fetch access token from Twitch API'
      );
    });

    it('should throw error if response is not ok', async () => {
      // Mock global fetch to return a non-ok response
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ error: 'Bad Request' })
      });

      await expect(service.getNewAccessToken()).rejects.toThrow(
        'Failed to fetch access token from Twitch API'
      );
    });
  });
});
