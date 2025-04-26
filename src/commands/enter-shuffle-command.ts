import { Command } from './command';

export class EnterShuffleCommand implements Command {
  readonly type = 'ENTER_SHUFFLE';

  public readonly user: string;

  constructor(user: string) {
    this.user = user;
  }
}
