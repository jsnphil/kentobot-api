import { SongRepository } from './SongRepository';
import { mockClient } from 'aws-sdk-client-mock';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';

describe('SongRepository', () => {
  const dynamodbMock = mockClient(DynamoDBClient);
  beforeEach(() => {
    dynamodbMock.reset();
  });

  it('should save the song', async () => {
    // Arrange
    const songRepository = new SongRepository();
    const song = {
      youtubeId: 'XXXXXXXXX',
      title: 'Sample Song',
      length: 180
    };

    dynamodbMock.on(PutItemCommand).resolves({
      $metadata: {
        httpStatusCode: 200
      }
    });

    console.log = jest.fn();

    // Act
    await songRepository.save(song);
    // Assert
    expect(console.log).toHaveBeenLastCalledWith(
      'Song info saved successfully'
    );
  });

  it('should throw an error if saving the song fails', async () => {
    // Arrange
    const songRepository = new SongRepository();
    const song = {
      youtubeId: 'XXXXXXXXX',
      title: 'Sample Song',
      length: 180
    };

    dynamodbMock.on(PutItemCommand).rejects({
      $metadata: {
        httpStatusCode: 500
      }
    });

    // Assert
    await expect(songRepository.save(song)).rejects.toThrow(
      'Failed to save song info'
    );
  });

  it('should not throw an error if the song information exists', async () => {
    // Arrange
    const songRepository = new SongRepository();
    const song = {
      youtubeId: 'XXXXXXXXX',
      title: 'Sample Song',
      length: 180
    };

    dynamodbMock.on(PutItemCommand).rejects(
      new ConditionalCheckFailedException({
        message: 'The conditional request failed',
        $metadata: {
          httpStatusCode: 400
        }
      })
    );

    console.log = jest.fn();

    await songRepository.save(song);
    expect(console.log).toHaveBeenLastCalledWith(
      'Song info has already been added, skipping...'
    );
  });
});
