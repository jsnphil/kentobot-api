import { TwitchAuthClient } from '../infra/auth-client';
import { AppTokenRecord, TwitchTokenStore } from '../infra/token-store';
import { TwitchAuthService } from './twitch-auth-service';

describe('TwitchAuthService', () => {
  describe('getValidAppToken', () => {
    let tokenStoreMock: jest.Mocked<TwitchTokenStore>;
    let clientMock: jest.Mocked<TwitchAuthClient>;
    let service: TwitchAuthService;

    beforeEach(() => {
      tokenStoreMock = {
        loadAppToken: jest.fn(),
        saveAppToken: jest.fn()
      } as unknown as jest.Mocked<TwitchTokenStore>;

      clientMock = {
        requestAppToken: jest.fn()
      } as unknown as jest.Mocked<TwitchAuthClient>;

      service = new TwitchAuthService(tokenStoreMock, clientMock);
    });

    it('should return a valid token if it is not expiring', async () => {
      const validToken: AppTokenRecord = {
        accessToken: 'valid-token',
        expiresAt: Date.now() + 100000,
        tokenType: 'app'
      };

      tokenStoreMock.loadAppToken.mockResolvedValue(validToken);

      const result = await service.getValidAppToken();

      expect(result).toBe(validToken.accessToken);
      expect(tokenStoreMock.loadAppToken).toHaveBeenCalledTimes(1);
      expect(clientMock.requestAppToken).not.toHaveBeenCalled();
    });

    it('should request a new token if the existing token is expiring', async () => {
      const expiringToken: AppTokenRecord = {
        accessToken: 'expiring-token',
        expiresAt: Date.now() + 50000,
        tokenType: 'app'
      };

      const newToken = {
        accessToken: 'new-token',
        expiresIn: Date.now() + 100000
      };

      tokenStoreMock.loadAppToken.mockResolvedValue(expiringToken);
      clientMock.requestAppToken.mockResolvedValue(newToken);

      const result = await service.getValidAppToken();

      expect(result).toBe(newToken.accessToken);
      expect(tokenStoreMock.loadAppToken).toHaveBeenCalledTimes(1);
      expect(clientMock.requestAppToken).toHaveBeenCalledTimes(1);
      expect(tokenStoreMock.saveAppToken).toHaveBeenCalledWith(newToken);
    });

    it('should request a new token if no token exists', async () => {
      const newToken = {
        accessToken: 'new-token',
        expiresIn: Date.now() + 100000
      };
      tokenStoreMock.loadAppToken.mockResolvedValue(null);
      clientMock.requestAppToken.mockResolvedValue(newToken);

      const result = await service.getValidAppToken();

      expect(result).toBe(newToken.accessToken);
      expect(tokenStoreMock.loadAppToken).toHaveBeenCalledTimes(1);
      expect(clientMock.requestAppToken).toHaveBeenCalledTimes(1);
      expect(tokenStoreMock.saveAppToken).toHaveBeenCalledWith(newToken);
    });
  });
});
