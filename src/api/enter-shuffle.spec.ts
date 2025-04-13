import { handler } from './enter-shuffle';
import { APIGatewayEvent } from 'aws-lambda';
import { Code } from 'better-status-codes';
import { EnterShuffleCommandHandler } from '../command-handlers/enter-shuffle-command-handler';

jest.mock('../command-handlers/enter-shuffle-command-handler');

describe('enter-shuffle handler', () => {
  const mockExecute = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (EnterShuffleCommandHandler as jest.Mock).mockImplementation(() => ({
      execute: mockExecute
    }));
  });

  it('should return 200 OK when user is provided', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({ user: 'Kaladin' })
    } as any;

    const response = await handler(event);

    expect(response.statusCode).toBe(Code.OK);
    expect(response.body).toBe(JSON.stringify({}));
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith(expect.anything());
  });

  it('should return 400 BAD_REQUEST when user is missing', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({})
    } as any;

    const response = await handler(event);

    expect(response.statusCode).toBe(Code.BAD_REQUEST);
    expect(response.body).toBe(JSON.stringify({ message: 'user is required' }));
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('should handle invalid JSON in the body', async () => {
    const event: APIGatewayEvent = {
      body: '{invalidJson}'
    } as any;

    const response = await handler(event);

    expect(response.statusCode).toBe(Code.BAD_REQUEST);
    expect(response.body).toBe(JSON.stringify({ message: 'user is required' }));
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors gracefully', async () => {
    mockExecute.mockRejectedValue(new Error('Unexpected error'));
    const event: APIGatewayEvent = {
      body: JSON.stringify({ user: 'Vin' })
    } as any;

    const response = await handler(event);

    expect(response.statusCode).toBe(Code.INTERNAL_SERVER_ERROR);
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });
});
