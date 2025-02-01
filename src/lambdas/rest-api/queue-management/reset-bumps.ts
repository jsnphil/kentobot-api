import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BumpService } from '../../../services/bump-service';

let bumpService: BumpService;

/* istanbul ignore next */
export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (!bumpService) {
    bumpService = new BumpService();
  }

  await bumpService.resetBumpCounts();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Bump counts reset'
    })
  };
};
