import { SaveSongCommand } from './save-song';

describe('save-song', () => {
  it('should save the song', async () => {
    // Arrange
    const saveSongCommand = new SaveSongCommand();
    const song = {
      youtubeId: 'XXXXXXXXX',
      title: 'Sample Song',
      length: 180
    };

    // Act
    await saveSongCommand.execute(song);

    // Assert
    // Add your assertions here to verify that the song was saved successfully
  });
});
