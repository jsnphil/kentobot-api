import { YouTubeService } from '../../../common/services/youtube-service';
import { SongRequestStatus } from '../../../types/song-request';
import { SongValidator } from '../validators/song-validator';

export class Song {
  public readonly id: string;
  public readonly requestedBy: string;
  public readonly title: string;
  public status: SongRequestStatus;
  public readonly duration: number; // in seconds

  private constructor(
    id: string,
    requestedBy: string,
    title: string,
    status: SongRequestStatus,
    duration: number
  ) {
    this.id = id;
    this.requestedBy = requestedBy;
    this.title = title;
    this.status = status;
    this.duration = duration;
  }

  public static async create(id: string, requestedBy: string): Promise<Song> {
    const youtubeVideo = await YouTubeService.getVideo(id);

    SongValidator.validate(youtubeVideo);
    return new Song(
      youtubeVideo.id,
      requestedBy,
      youtubeVideo.title,
      SongRequestStatus.QUEUED,
      youtubeVideo.duration
    );
  }

  public static load(
    id: string,
    requestedBy: string,
    title: string,
    status: SongRequestStatus,
    duration: number
  ): Song {
    return new Song(id, requestedBy, title, status, duration);
  }

  // Add methods to update status, e.g., for bumping or shuffling
  // public setStatus(
  //   newStatus: 'in queue' | 'bumped' | 'in shuffle' | 'shuffle winner'
  // ): void {
  //   this.status = newStatus;
  // }

  // Other domain-related behavior for the song can go here
}
