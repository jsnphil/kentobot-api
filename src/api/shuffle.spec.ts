import request from 'supertest';
import { handler } from './shuffle';
import { APIGatewayEvent } from 'aws-lambda';
import { Code } from 'better-status-codes';
import { ShuffleCommandHandler } from '../command-handlers/shuffle-command-handler';
import { SelectWinnerCommand } from '../commands/shuffle/select-winner-command';

jest.mock('../command-handlers/shuffle-command-handler');

describe('Shuffle API Handler', () => {
  let mockExecute: jest.Mock;

  beforeEach(() => {
    mockExecute = jest.fn();
    (ShuffleCommandHandler as jest.Mock).mockImplementation(() => ({
      execute: mockExecute
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /select-winner', () => {
    it('should return the winner when the command executes successfully', async () => {
      const mockWinner = { id: 'user123', name: 'John Doe' };
      mockExecute.mockResolvedValue(mockWinner);

      const event = {
        body: null,
        path: '/select-winner',
        httpMethod: 'POST',
        headers: {},
        queryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {} as any,
        resource: '',
        isBase64Encoded: false
      } as unknown as APIGatewayEvent;

      const response = await handler(event);

      expect(mockExecute).toHaveBeenCalledWith(expect.any(SelectWinnerCommand));
      expect(response.statusCode).toBe(Code.OK);
      expect(JSON.parse(response.body)).toEqual({ winner: mockWinner });
    });

    // it('should handle errors when executing the command', async () => {
    //   mockExecute.mockRejectedValue(new Error('Something went wrong'));

    //   const event = {
    //     body: null,
    //     path: '/select-winner',
    //     httpMethod: 'POST',
    //     headers: {},
    //     queryStringParameters: null,
    //     pathParameters: null,
    //     stageVariables: null,
    //     requestContext: {} as any,
    //     resource: '',
    //     isBase64Encoded: false
    //   } as unknown as APIGatewayEvent;

    //   const response = await handler(event);

    //   expect(mockExecute).toHaveBeenCalledWith(expect.any(SelectWinnerCommand));
    //   expect(response.statusCode).toBe(Code.INTERNAL_SERVER_ERROR);
    // });
  });
});
