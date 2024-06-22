import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Your code logic here

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Lambda function executed successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred' })
    };
  }
};
