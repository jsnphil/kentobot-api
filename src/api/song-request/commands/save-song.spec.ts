import { SaveSongCommand } from './save-song';
import { SongRepository } from '../../../repositories/SongRepository';

beforeEach(() => {
  jest.resetAllMocks;
  jest.clearAllMocks;
});

describe('save-song', () => {
  it('should save the song', async () => {
    // Arrange
    const saveSongCommand = new SaveSongCommand();
    const song = {
      youtubeId: 'XXXXXXXXX',
      title: 'Sample Song',
      length: 180
    };

    const mockSave = jest
      .spyOn(SongRepository.prototype, 'save')
      .mockImplementation(jest.fn());

    // Act
    await saveSongCommand.execute(song);

    // Assert
    expect(mockSave).toHaveBeenCalledTimes(1);
    // Add your assertions here to verify that the song was saved successfully
  });

  it('should throw an error when the song fails to save', async () => {
    // Arrange
    const saveSongCommand = new SaveSongCommand();
    const song = {
      youtubeId: 'XXXXXXXXX',
      title: 'Sample Song',
      length: 180
    };

    // Mock the SongRepository save method to throw an error
    jest
      .spyOn(SongRepository.prototype, 'save')
      .mockRejectedValueOnce(new Error('Failed to save song'));

    // Act and Assert
    await expect(saveSongCommand.execute(song)).rejects.toThrow(
      'Failed to save song'
    );
  });

  // it('should not save the song if the YouTube ID is missing', async () => {
  //   // Arrange
  //   const saveSongCommand = new SaveSongCommand();
  //   const song = {
  //     title: 'Sample Song',
  //     length: 180
  //   };

  //   // Act and Assert
  //   await expect(saveSongCommand.execute(song)).rejects.toThrow('YouTube ID is required');
  // });

  // it('should not save the song if the title is missing', async () => {
  //   // Arrange
  //   const saveSongCommand = new SaveSongCommand();
  //   const song = {
  //     youtubeId: 'XXXXXXXXX',
  //     length: 180
  //   };

  //   // Act and Assert
  //   await expect(saveSongCommand.execute(song)).rejects.toThrow('Title is required');
  // });

  // it('should not save the song if the length is missing', async () => {
  //   // Arrange
  //   const saveSongCommand = new SaveSongCommand();
  //   const song = {
  //     youtubeId: 'XXXXXXXXX',
  //     title: 'Sample Song'
  //   };

  //   // Act and Assert
  //   await expect(saveSongCommand.execute(song)).rejects.toThrow(
  //     'Length is required'
  //   );
  // });
  // it('should save the song', async () => {
  //   // Arrange
  //   const saveSongCommand = new SaveSongCommand();
  //   const song = {
  //     youtubeId: 'XXXXXXXXX',
  //     title: 'Sample Song',
  //     length: 180
  //   };

  //   // Act
  //   await saveSongCommand.execute(song);
  //   // expect(SongRepository).toHaveBeenCalled;
  //   expect(SongRepository).toHaveBeenCalledTimes(1);

  //   // Assert
  //   // Add your assertions here to verify that the song was saved successfully
  // });

  // it('should throw an error when the song fails to save', async () => {
  //   // expect(SongRepository).not.toHaveBeenCalled();

  //   // const mockSongRepo = jest.spyOn(songRepo, 'save');
  //   // Arrange
  //   const saveSongCommand = new SaveSongCommand();
  //   const song = {
  //     youtubeId: 'XXXXXXXXX',
  //     title: 'Sample Song',
  //     length: 180
  //   };

  //   // expect(SongRepository).toHaveBeenCalled();

  //   // expect(() => {
  //   //   saveSongCommand.execute(song);
  //   // }).toThrow('Failed to save song');

  //   await expect(saveSongCommand.execute(song)).rejects.toThrow(
  //     'Failed to save song'
  //   );
  // });
});
