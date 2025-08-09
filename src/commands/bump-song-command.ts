import { BumpType } from '../types/song-request';

export class BumpSongCommand {
  public readonly bumpType: BumpType;
  public readonly requestedBy: string;
  public readonly position?: number;
  public readonly modOverride?: boolean;

  constructor(
    bumpType: BumpType,
    requestedBy: string,
    position?: number,
    modOverride?: boolean
  ) {
    this.bumpType = bumpType;
    this.requestedBy = requestedBy;
    this.position = position;
    this.modOverride = modOverride;
  }
}
