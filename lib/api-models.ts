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

export const saveSongRequestModel = (
  scope: Construct,
  api: apiGateway.RestApi
) => {
  return new apiGateway.Model(scope, 'save-song-request', {
    restApi: api,
    contentType: 'application/json',
    schema: {
      type: apiGateway.JsonSchemaType.OBJECT,
      required: ['youtubeId', 'title', 'length', 'requestedBy'],
      properties: {
        youtubeId: { type: apiGateway.JsonSchemaType.STRING },
        title: { type: apiGateway.JsonSchemaType.STRING },
        length: { type: apiGateway.JsonSchemaType.NUMBER },
        requestedBy: { type: apiGateway.JsonSchemaType.STRING },
        played: { type: apiGateway.JsonSchemaType.STRING }
      }
    }
  });
};

export const saveSongPlayResponseModel = (
  scope: Construct,
  api: apiGateway.RestApi
) => {
  return new apiGateway.Model(scope, 'save-song-play-response-model', {
    restApi: api,
    schema: {
      type: apiGateway.JsonSchemaType.OBJECT,
      properties: {
        message: { type: apiGateway.JsonSchemaType.STRING },
        eventId: {
          type: apiGateway.JsonSchemaType.STRING
        }
      }
    }
  });
};
