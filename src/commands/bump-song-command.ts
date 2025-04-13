import { BumpType } from '../types/song-request';

export class BumpSongCommand {
  public readonly bumpType: BumpType;
  public readonly requestdBy: string;
  public readonly position?: number;
  public readonly modOverride?: boolean;

  constructor(
    bumpType: BumpType,
    requestedBy: string,
    position?: number,
    modOverride?: boolean
  ) {
    this.bumpType = bumpType;
    this.requestdBy = requestedBy;
    this.position = position;
    this.modOverride = modOverride;
  }
}
