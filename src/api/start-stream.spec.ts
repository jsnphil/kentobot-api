import { handler } from './start-stream';
import { APIGatewayEvent } from 'aws-lambda';
import { Code } from 'better-status-codes';
import { KentobotErrorCode } from '../types/types';
import { StartStreamCommandHandler } from '@command-handlers/start-stream-command-handler';
import { generateStreamDate } from '@utils/utilities';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@command-handlers/start-stream-command-handler');
vi.mock('@utils/utilities');

describe('start-stream handler', () => {
  let mockEvent: APIGatewayEvent;

  beforeEach(() => {
    mockEvent = {} as APIGatewayEvent;
    vi.clearAllMocks();
  });

  it('should return 201 Created when stream starts successfully', async () => {
    (generateStreamDate as any).mockReturnValue('2023-10-01');
    (StartStreamCommandHandler.prototype.execute as any).mockResolvedValue(
      undefined
    );

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(Code.Created);
    expect(result.body).toBe('');
    expect(StartStreamCommandHandler.prototype.execute).toHaveBeenCalled();
  });

  it('should return 409 Conflict when stream already exists', async () => {
    (generateStreamDate as any).mockReturnValue('2023-10-01');
    (StartStreamCommandHandler.prototype.execute as any).mockRejectedValue(
      new Error('Stream already exists')
    );

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(Code.Conflict);
    expect(result.body).toBe(
      JSON.stringify({
        error: {
          code: KentobotErrorCode.StreamAlreadyExists,
          message: 'Stream already exists'
        }
      })
    );
  });

  it('should return 500 Internal Server Error for other errors', async () => {
    (generateStreamDate as any).mockReturnValue('2023-10-01');
    (StartStreamCommandHandler.prototype.execute as any).mockRejectedValue(
      new Error('Some other error')
    );

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(Code.INTERNAL_SERVER_ERROR);
    expect(result.body).toBe(
      JSON.stringify({
        error: {
          code: KentobotErrorCode.SystemError,
          message: 'An error occurred while starting the stream'
        }
      })
    );
  });
});
