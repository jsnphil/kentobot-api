import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Code } from 'better-status-codes';

export function apiLambdaWrapper<
  T extends (event: APIGatewayEvent) => Promise<APIGatewayProxyResult>
>(
  p0: (event: APIGatewayEvent) => Promise<{ statusCode: 200; body: string }>,
  handle: T
) {
  return async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
      const result = await handle(event);
      return result;
    } catch (error) {
      console.error('Error processing request:', error);

      /*
Sample error handling
   if (error instanceof SomeCustomError) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: error.message }),
        };
      }*/

      return {
        statusCode: Code.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          error: {
            code: 'SystemError',
            message: 'An error occurred while processing the request'
          }
        })
      };
    }
  };
}
