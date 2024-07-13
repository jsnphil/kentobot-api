import { SongPlayRepository } from '../../../repositories/SongPlayRepository';
import { SaveSongPlayCommand } from './save-song-play';

beforeEach(() => {
  jest.resetAllMocks;
  jest.clearAllMocks;
});
describe('save-song-play', () => {
  it('should save the song play', async () => {
    // Arrange
    const saveSongPlayCommand = new SaveSongPlayCommand();
    const songPlay = {
      date: new Date(),
      requester: 'user1',
      sotnContender: false,
      sotnWinner: false,
      sotsWinner: false
    };

    const mockSave = jest
      .spyOn(SongPlayRepository.prototype, 'save')
      .mockImplementation(jest.fn());

    // Act
    await saveSongPlayCommand.execute('XXXXXXXXX', songPlay);
    // Assert
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the song play fails to save', async () => {
    // Arrange
    const saveSongPlayCommand = new SaveSongPlayCommand();
    const songPlay = {
      date: new Date(),
      requester: 'user1',
      sotnContender: false,
      sotnWinner: false,
      sotsWinner: false
    };

    // Mock the SongRepository save method to throw an error
    jest
      .spyOn(SongPlayRepository.prototype, 'save')
      .mockRejectedValueOnce(new Error('Failed to save song play'));

    // Act and Assert
    await expect(
      saveSongPlayCommand.execute('XXXXXXXXX', songPlay)
    ).rejects.toThrow('Failed to save song');
  });
});
