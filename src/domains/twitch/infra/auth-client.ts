// src/domains/twitch/infra/twitch-auth-client.ts

const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
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

    if (response.status !== 200) {
      throw new Error(`Failed to fetch app token: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  }
}
