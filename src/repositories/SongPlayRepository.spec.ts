import { mockClient } from 'aws-sdk-client-mock';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { SongPlayRepository } from './SongPlayRepository';
import { SongPlay } from '../types/song-request';

describe('SongPlayRepository', () => {
  const dynamodbMock = mockClient(DynamoDBClient);
  beforeEach(() => {
    dynamodbMock.reset();
  });

  it('should save the song', async () => {
    // Arrange
    const songPlayRepository = new SongPlayRepository();
    const songPlay = {
      date: new Date(),
      requester: 'requester',
      sotnContender: false,
      sotnWinner: false,
      sotsWinner: false
    } as SongPlay;

    dynamodbMock.on(PutItemCommand).resolves({
      $metadata: {
        httpStatusCode: 200
      }
    });

    console.log = jest.fn();

    // Act
    await songPlayRepository.save('songId', songPlay);

    // Assert
    expect(console.log).toHaveBeenLastCalledWith(
      'Song play saved successfully'
    );
  });

  it('should throw an error if saving the song fails', async () => {
    // Arrange
    const songPlayRepository = new SongPlayRepository();
    const songPlay = {
      date: new Date(),
      requester: 'requester',
      sotnContender: false,
      sotnWinner: false,
      sotsWinner: false
    } as SongPlay;

    dynamodbMock.on(PutItemCommand).rejects({
      $metadata: {
        httpStatusCode: 500
      }
    });

    // Assert
    await expect(songPlayRepository.save('songId', songPlay)).rejects.toThrow(
      'Failed to save song play information'
    );
  });
});
