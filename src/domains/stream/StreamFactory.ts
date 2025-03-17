import { Stream } from "./models/stream";

export class StreamFactory {
  public static async createStream(streamDate: string): Promise<Stream> {
    return Stream.create(streamDate);
  }
}
