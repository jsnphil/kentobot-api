import { Command } from "./command";

export class ToggleShuffleCommand implements Command {
  readonly type = 'TOGGLE_SHUFFLE';

  public readonly status: 'open' | 'close';

  constructor(status: 'open' | 'close') {
    this.status = status;
  }
}
