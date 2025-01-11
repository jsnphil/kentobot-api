import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export const errorResponses = [
  {
    selectionPattern: '4\\d{2}', // Match all 4xx errors
    statusCode: '400',
    responseTemplates: {
      'application/json': `{
            "code": 400,
            "message": "Invalid input",
            "errors": []
          }`
    }
  },
  {
    selectionPattern: '5\\d{2}', // Match all 5xx errors
    statusCode: '500',
    responseTemplates: {
      'application/json': `{
            "code": 500,
            "message": "Invalid input",
            "errors": []
          }`
    }
  }
];

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

export const getSongPlaysResponseModel = (
  scope: Construct,
  api: apiGateway.RestApi
) => {
  return new apiGateway.Model(scope, 'get-song-plays-response-model', {
    restApi: api,
    schema: {
      type: apiGateway.JsonSchemaType.OBJECT,
      properties: {
        youtubeId: { type: apiGateway.JsonSchemaType.STRING },
        plays: {
          type: apiGateway.JsonSchemaType.ARRAY,
          items: {
            type: apiGateway.JsonSchemaType.OBJECT,
            properties: {
              date: { type: apiGateway.JsonSchemaType.STRING },
              requestedBy: { type: apiGateway.JsonSchemaType.STRING },
              sotnContender: { type: apiGateway.JsonSchemaType.BOOLEAN },
              sotnWinner: { type: apiGateway.JsonSchemaType.BOOLEAN },
              sotsWinner: { type: apiGateway.JsonSchemaType.BOOLEAN }
            }
          }
        }
      }
    }
  });
};
