export async function getAccessToken(): Promise<string> {
  // const twitchTokenService = new TwitchTokenService();
  // const twitchAPIService = new TwitchAPIService(
  //   TWITCH_CLIENT_ID,
  //   TWITCH_CLIENT_SECRET
  // );

  // const storedToken = await twitchTokenService.getStoredToken();

  // if (storedToken && Date.now() < storedToken.expiration) {
  //   return storedToken.token;
  // }

  // const { token, expiresIn } = await twitchAPIService.fetchNewToken();
  // const expirationTime = Date.now() + expiresIn * 1000;

  // await twitchTokenService.storeToken(token, expirationTime);

  const token = '';
  return token;
}
