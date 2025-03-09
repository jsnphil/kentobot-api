export const handler = async (event: any): Promise<void> => {
  console.log('Song added to queue');
  console.log('Received event:', event);
};
