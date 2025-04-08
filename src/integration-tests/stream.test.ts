import request from 'supertest';
import { API_ENDPOINT, SONG_REQUEST, STREAM } from './urls';

describe('Song Request API Integration', () => {
  afterAll(() => {
    // TODO Delete saved stream
  });

  describe('Stream Initialization', () => {
    it('should start a new stream', async () => {
      const response = await request(API_ENDPOINT)
        .post(STREAM)
        .set('X-API-Key', 'hoqnGWpCrL5ora4kdBtds2mZXpYuCGxs91Rai0JZ');
      // .set('x-test-mode', 'true') // Optional: flag to separate test data

      console.log(response.body);

      expect(response.status).toBe(201);
    });

    it('should fail to start a new stream when one already exists', async () => {
      const response = await request(API_ENDPOINT)
        .post(STREAM)
        .set('X-API-Key', 'hoqnGWpCrL5ora4kdBtds2mZXpYuCGxs91Rai0JZ');
      // .set('x-test-mode', 'true') // Optional: flag to separate test data

      console.log(response.body);

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        error: {
          code: 'STREAM_ALREADY_EXISTS',
          message: 'Stream already exists'
        }
      });
    });
  });

  describe('Adding Songs to Queue', () => {
    it('should add a new song to the queue', async () => {
      const response = await request(API_ENDPOINT)
        .post(SONG_REQUEST)
        .set('X-API-Key', 'hoqnGWpCrL5ora4kdBtds2mZXpYuCGxs91Rai0JZ')
        // .set('x-test-mode', 'true') // Optional: flag to separate test data
        .send({
          youtubeId: 'GmS3ieOOL-4',
          requestedBy: 'Kaladin'
        });

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        song: {
          user: 'Kaladin',
          title: 'Song Title'
        }
      });
    });
  });
});
