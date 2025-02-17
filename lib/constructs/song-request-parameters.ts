import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export const createSongRequestParameters = (
  scope: Construct,
  environment: string
) => {
  // Setup SSM parameters for song request rules

  const publicVideoToggle = new StringParameter(scope, 'PublicVideoToggle', {
    stringValue: 'false',
    allowedPattern: 'true|false',
    description: 'Toggle to limit requests to only videos that are public',
    parameterName: `/${environment}/request-rules/public-video-toggle`
  });

  const requestDurationLimit = new StringParameter(
    scope,
    `RequestDurationLimit-${environment}`,
    {
      stringValue: '360',
      allowedPattern: '^\\d+$',
      description: 'Maximum length duration (in seconds) for song requests',
      parameterName: `/${environment}/request-rules/length-limits/song-request`
    }
  );

  const djRequestDurationLimit = new StringParameter(
    scope,
    `DJRequestDurationLimit-${environment}`,
    {
      stringValue: '420',
      allowedPattern: '^\\d+$',
      description: 'Maximum length duration (in seconds) for DJ hour requests',
      parameterName: `/${environment}/request-rules/length-limits/dj-hour-request`
    }
  );

  const licensedContentToggle = new StringParameter(
    scope,
    `LicensedContentToggle-${environment}`,
    {
      stringValue: 'false',
      allowedPattern: 'true|false',
      description:
        'Toggle to limit requests to only videos that are licensed by YouTube',
      parameterName: `/${environment}/request-rules/licensed-videos`
    }
  );

  const maxSongRequestsPerUser = new StringParameter(
    scope,
    `MaxSongsRequestsPerUser-${environment}`,
    {
      stringValue: '1',
      allowedPattern: '^\\d+$',
      description:
        'Maximum number of requests a user can have in the queue at a time',
      parameterName: `/${environment}/request-rules/user-request-limit`
    }
  );

  return {
    publicVideoToggle,
    requestDurationLimit,
    djRequestDurationLimit,
    licensedContentToggle,
    maxSongRequestsPerUser
  };
};
