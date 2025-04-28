export class AddSongToHistoryCommand implements Command {
  readonly type = 'ADD_SONG_TO_HISTORY';

  public readonly songId: string;

  constructor(songId: string) {
    this.songId = songId;
  }
}
