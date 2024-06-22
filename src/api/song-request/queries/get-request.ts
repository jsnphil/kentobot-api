import { processSongRequestRules } from '../../../utils/song-request-rules';
import { searchForVideo } from '../../../utils/youtube-client';
var moment = require('moment');

export class GetRequestQuery {
  async execute(songId: string) {
    console.log(`Getting song request for song ID: ${songId}`);

    // TODO Check if the request exists in the database

    const videos = await searchForVideo(songId);

    console.log(`Found ${videos.length} videos`);

    if (!videos || videos.length === 0) {
      console.log(`No results returned`);
      return undefined;
    }

    if (videos.length > 1) {
      console.log(
        `Too many results found, Recieved  ${videos.length}, expected 1`
      );

      return {
        failedRules: ['Too many results']
      };
    }

    const video = videos[0];
    const rulesCheck = await processSongRequestRules(video);

    return {
      title: video.snippet.title,
      youtubeId: video.id,
      length: moment
        .duration(video.contentDetails.duration, moment.ISO_8601)
        .asSeconds()
    };
  }
}
