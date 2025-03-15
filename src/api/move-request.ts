import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const songId = event.pathParameters?.songId;

  const body = JSON.parse(event.body || '{}');
  const { position } = body;

  if (!songId || !position) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'songId and position are required'
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Move request processed successfully'
    })
  };
};
