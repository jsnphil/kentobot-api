import { TwitchTokenResponse } from '../../types/twitch';

// TODO Remove this when this class is worked on
  /* istanbul ignore next */
export class TwitchAPIService {
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async fetchNewToken(): Promise<{ token: string; expiresIn: number }> {
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
      expiresIn: data.expires_in
    };
  }
}
