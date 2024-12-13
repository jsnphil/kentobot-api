import { mockClient } from 'aws-sdk-client-mock';
import { getSongRequest, sendEvent } from './event-producer';
import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge';

const mockEventBridgeClient = mockClient(EventBridgeClient);

describe('getSongRequest', () => {
  it('should return a song request for a valid body', () => {
    const body = {
      youtubeId: 'abc123',
      title: 'test song',
      length: 180,
      played: new Date().toISOString(),
      requestedBy: 'test-user'
    };

    const songRequest = getSongRequest(JSON.stringify(body));

    expect(songRequest).toBeDefined();
  });

  it('should throw an error for an null body', () => {
    expect(() => getSongRequest(null)).toThrow('No song data provided');
  });

  it('should throw an error for an invalid body', () => {
    expect(() => getSongRequest(JSON.stringify({ body: 'invalid' }))).toThrow(
      'Invalid song data'
    );
  });

  it('should throw an error for an song request body with an invalid date', () => {
    const body = {
      youtubeId: 'abc123',
      title: 'test song',
      length: 180,
      played: 'invalid-date',
      requestedBy: 'test-user'
    };

    expect(() => getSongRequest(JSON.stringify(body))).toThrow(
      'Invalid song data'
    );
  });
});

describe('sendEvent', () => {
  it('should return an event id for a successful event', async () => {
    process.env.EVENT_BUS_NAME = 'test-bus';

    const songRequest = {
      youtubeId: 'abc123',
      title: 'test song',
      length: 180,
      requestedBy: 'test-user'
    };

    mockEventBridgeClient.on(PutEventsCommand).resolves({
      Entries: [
        {
          EventId: '123'
        }
      ]
    });

    const eventId = await sendEvent('song-played', songRequest);

    expect(eventId).toBe('123');
  });

  it('should throw an error for a failed event', async () => {
    process.env.EVENT_BUS_NAME = 'test-bus';

    const songRequest = {
      youtubeId: 'abc123',
      title: 'test song',
      length: 180,
      requestedBy: 'test-user'
    };

    mockEventBridgeClient.on(PutEventsCommand).resolves({
      FailedEntryCount: 1
    });

    await expect(() => sendEvent('song-played', songRequest)).rejects.toThrow(
      'Failed to send event'
    );
  });

  it('should throw an error if the AWS SDK fails', async () => {
    process.env.EVENT_BUS_NAME = 'test-bus';

    const songRequest = {
      youtubeId: 'abc123',
      title: 'test song',
      length: 180,
      requestedBy: 'test-user'
    };

    mockEventBridgeClient.on(PutEventsCommand).rejects(new Error('Failed'));

    await expect(() => sendEvent('song-played', songRequest)).rejects.toThrow(
      'Failed to send event'
    );
  });

  it('should throw an error if the event bus name is not defined', async () => {
    delete process.env.EVENT_BUS_NAME;

    await expect(() => sendEvent('song-played', {})).rejects.toThrow(
      'Event bus name is not defined'
    );
  });
});
