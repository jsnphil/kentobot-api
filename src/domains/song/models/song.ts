export class Song {
  public readonly id: string;
  public readonly requestedBy: string;
  public readonly title: string;
  public status: 'in queue' | 'bumped' | 'in shuffle' | 'shuffle winner'; // TODO Change this later, maybe an enum
  public readonly duration: number; // in seconds

  constructor(
    id: string,
    requestedBy: string,
    title: string,
    status: 'in queue' | 'bumped' | 'in shuffle' | 'shuffle winner',
    duration: number
  ) {
    this.id = id;
    this.requestedBy = requestedBy;
    this.title = title;
    this.status = status;
    this.duration = duration;
  }

  // Add methods to update status, e.g., for bumping or shuffling
  public setStatus(
    newStatus: 'in queue' | 'bumped' | 'in shuffle' | 'shuffle winner'
  ): void {
    this.status = newStatus;
  }

  // Other domain-related behavior for the song can go here
}
