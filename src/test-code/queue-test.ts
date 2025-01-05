import { SongQueue } from '../song-queue';

export const handler = async (event: any) => {
  const songQueue = await SongQueue.loadQueue();

  // Populate the song queue with 10 items
  for (let i = 1; i <= 10; i++) {
    const songRequest = {
      youtubeId: `youtubeId${i}`,
      title: `Song title ${i}`,
      length: 100 + i,
      requestedBy: `user${i}`
    };
    songQueue.addSong(songRequest);
    console.log(`Added song ${JSON.stringify(songRequest)}`);
  }

  console.log(`Queue length: ${songQueue.getLength()}`);
  console.log(`Queue: ${JSON.stringify(songQueue.toArray(), null, 2)}`);

  // Save the queue
  console.log('Saving the queue');
  await songQueue.save();
  console.log('Queue saved');

  console.log('Removing song youtubeId5');
  songQueue.removeSong('youtubeId5');
  console.log('Song removed');

  console.log('Saving the queue');
  await songQueue.save();
  console.log('Queue saved');

  console.log('Moving song youtubeId6 to position 3');
  songQueue.moveSong('youtubeId6', 3);
  console.log('Song moved');

  console.log('Saving the queue');
  await songQueue.save();
  console.log('Queue saved');

  // Clear the queue
  await songQueue.clear();

  return {
    statusCode: 200
  };
};
