// tests/integration/song-request.test.ts
import request from 'supertest';
import { API_ENDPOINT } from './urls';

const path = '/streams/current/queue/request-song';

describe('Song Request API Integration', () => {

  
  it('should add a new song to the queue', async () => {
    const response = await request(API_ENDPOINT)
      .post(path)
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
