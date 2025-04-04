export class GetQueueRequest {
  public readonly streamId: string;

  constructor(streamId: string) {
    this.streamId = streamId;
  }
}
