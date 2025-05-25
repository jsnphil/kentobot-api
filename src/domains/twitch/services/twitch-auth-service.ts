// src/domains/twitch/services/twitch-auth-service.ts

import { TwitchAuthClient } from '../../../infrastructure/twitch/auth-client';
import { TwitchTokenStore } from '../infra/token-store';

export class TwitchAuthService {
  constructor(
    private readonly tokenStore: TwitchTokenStore,
    private readonly client: TwitchAuthClient
  ) {}

  async getValidAppToken(): Promise<string> {
    const token = await this.tokenStore.loadAppToken();

    // TOOD Verify token with /validate endpoint

    if (token && !this.isExpiring(token.expiresAt)) {
      return token.accessToken;
    }

    const newToken = await this.client.requestAppToken();
    await this.tokenStore.saveAppToken(newToken);
    return newToken.accessToken;
  }

  private isExpiring(expiresAt: number): boolean {
    const bufferMs = 60 * 1000;
    return Date.now() >= expiresAt - bufferMs;
  }
}
