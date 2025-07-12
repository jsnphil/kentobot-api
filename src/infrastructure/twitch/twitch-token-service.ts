import { TwitchRepository } from '@repositories/twitch-repository';
import { TwitchTokenResponse } from '../../types/twitch';

// TODO Remove this when this class is worked on
/* istanbul ignore next */
export class TwitchTokenService {
  private clientId: string;
  private clientSecret: string;

  async getToken() {
    const { accessToken, expiresAt } = await TwitchRepository.getAppToken();

    if (new Date() < new Date(expiresAt)) {
      return accessToken;
    }

    const newAccessToken = await this.getNewAccessToken();
    const expiration = new Date(
      Date.now() + newAccessToken.expiresIn * 1000
    ).toISOString();

    await TwitchRepository.saveAppToken(newAccessToken.token, expiration);
    return newAccessToken.token;
  }

  async getNewAccessToken(): Promise<{
    token: string;
    expiresIn: number;
    bearerType: string;
  }> {
    const url = 'https://id.twitch.tv/oauth2/token';
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials'
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch access token from Twitch API');
    }

    const data = (await response.json()) as TwitchTokenResponse;
    return {
      token: data.access_token,
      expiresIn: data.expires_in,
      bearerType: data.token_type
    };
  }
}
