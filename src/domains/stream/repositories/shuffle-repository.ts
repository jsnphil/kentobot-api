import { Shuffle } from '../../shuffle/models/shuffle';

export class ShuffleRepository {
  async getCurrentShuffle(): Promise<Shuffle | null> {
    // TODO Implement this method to retrieve the current shuffle from the database
    return null;
  }

  async saveShuffle(shuffle: Shuffle): Promise<void> {
    // TODO Implement this method to save the shuffle to the database
    // For example, you might use an ORM or a direct database query here
  }
}
