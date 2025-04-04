import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

import { Code } from 'better-status-codes';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: Code.NOT_IMPLEMENTED,
    body: JSON.stringify({
      message: 'Endpoint not implemented'
    })
  };
};
