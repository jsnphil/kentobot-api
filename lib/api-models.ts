import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export const songRequestDetailsModel = (
  scope: Construct,
  api: apiGateway.RestApi
) => {
  return new apiGateway.Model(scope, 'song-details-model', {
    restApi: api,
    schema: {
      type: apiGateway.JsonSchemaType.OBJECT,
      properties: {
        items: {
          type: apiGateway.JsonSchemaType.ARRAY,
          items: {
            type: apiGateway.JsonSchemaType.OBJECT,
            properties: {
              youtubeId: { type: apiGateway.JsonSchemaType.STRING },
              title: { type: apiGateway.JsonSchemaType.STRING },
              length: { type: apiGateway.JsonSchemaType.NUMBER }
            }
          }
        }
      }
    }
  });
};
