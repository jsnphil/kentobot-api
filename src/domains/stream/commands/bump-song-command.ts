import { BumpType } from '../../../types/song-request';

export class BumpSongCommand {
  public readonly bumpType: BumpType;
  public readonly requestdBy: string;
  public readonly position?: number;
  public readonly modOverride?: boolean;
}
