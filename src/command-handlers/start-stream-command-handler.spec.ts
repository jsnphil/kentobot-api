import { StartStreamCommandHandler } from './start-stream-command-handler';
import { StartStreamCommand } from '@commands/start-stream-command';
import { StreamRepository } from '@repositories/stream-repository';
import { Stream } from '@domains/stream/models/stream';
import { Logger } from '@aws-lambda-powertools/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@repositories/stream-repository');
vi.mock('@domains/stream/models/stream');

describe('StartStreamCommandHandler', () => {
  let handler: StartStreamCommandHandler;

  beforeEach(() => {
    handler = new StartStreamCommandHandler();
    vi.clearAllMocks();
  });

  it('should throw an error if a stream already exists for the given date', async () => {
    const command = new StartStreamCommand('2023-10-01');
    (StreamRepository.loadStream as any).mockResolvedValue({});

    await expect(handler.execute(command)).rejects.toThrow(
      'Stream already exists'
    );
    expect(StreamRepository.loadStream).toHaveBeenCalledWith('2023-10-01');
  });

  it('should create and save a new stream if no stream exists for the given date', async () => {
    const command = new StartStreamCommand('2023-10-01');
    (StreamRepository.loadStream as any).mockResolvedValue(null);
    (Stream.create as any).mockReturnValue({ id: 'stream-id' });

    const loggerSpy = vi.spyOn(Logger.prototype, 'info');

    await handler.execute(command);

    expect(StreamRepository.loadStream).toHaveBeenCalledWith('2023-10-01');
    expect(Stream.create).toHaveBeenCalledWith('2023-10-01');
    expect(StreamRepository.saveStream).toHaveBeenCalledWith({
      id: 'stream-id'
    });
    expect(loggerSpy).toHaveBeenCalledWith(
      'Stream started for date: 2023-10-01'
    );
  });
});
