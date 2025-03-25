import { handler } from './move-request';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { jest } from '@jest/globals';

describe('move-request handler', () => {
  const context: Context = {} as any;

  it('should return 400 if songId is missing', async () => {
    const event: APIGatewayEvent = {
      pathParameters: {},
      body: JSON.stringify({ position: 1 })
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      'songId and position are required'
    );
  });

  it('should return 400 if position is missing', async () => {
    const event: APIGatewayEvent = {
      pathParameters: { songId: '123' },
      body: JSON.stringify({})
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      'songId and position are required'
    );
  });

  it('should return 200 if songId and position are provided', async () => {
    const event: APIGatewayEvent = {
      pathParameters: { songId: '123' },
      body: JSON.stringify({ position: 1 })
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe(
      'Move request processed successfully'
    );
  });
});
