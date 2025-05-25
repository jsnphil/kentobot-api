// src/domains/twitch/infra/twitch-auth-client.ts

import { Code } from 'better-status-codes';

// const clientId = process.env.TWITCH_CLIENT_ID!;
const clientId = 'zn7bzocvwf97qg8pt6e3jaqscfmip7';
const clientSecret = '6v7ffgvogj3too8uj8njdvo4vvjfgd';
// const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
const tokenEndpoint = 'https://id.twitch.tv/oauth2/token';

export class TwitchAuthClient {
  async requestAppToken(): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    console.log(`Client ID: ${clientId}`);
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });

    if (response.status !== Code.OK) {
      throw new Error(`Failed to fetch app token: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  }

  /* istanbul ignore next */
  async validateToken(token: string): Promise<boolean> {
    const response = await fetch(`https://id.twitch.tv/oauth2/validate`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status !== Code.OK) {
      throw new Error(`Failed to validate token: ${response.statusText}`);
    }

    return true;
  }
}
