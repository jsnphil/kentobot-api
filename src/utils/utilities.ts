import { APIGatewayProxyEventPathParameters } from 'aws-lambda';
import { Readable } from 'stream';

export const createNewErrorResponse = (
  statusCode: number,
  message: string,
  errors: string[]
) => {
  return {
    body: JSON.stringify({
      code: statusCode,
      message: message,
      errors: errors
    }),
    statusCode: statusCode
  };
};

export const padTimeDigits = (number: number) => {
  if (number < 10) {
    return '0' + number;
  }

  return number.toString();
};

/* istanbul ignore next */
export async function streamToString(readableData: Readable): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    readableData.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    readableData.on('error', reject);
    readableData.on('end', () =>
      resolve(Buffer.concat(chunks).toString('utf-8'))
    );
  });
}

/* istanbul ignore next */
export const generateStreamDate = () => {
  return new Date()
    .toLocaleDateString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .split('/')
    .reverse()
    .join('-');
};

export const secondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${padTimeDigits(remainingSeconds)}`;
};

export const getSongId = (
  pathParameters: APIGatewayProxyEventPathParameters | null
) => {
  if (pathParameters == null || !pathParameters) {
    return undefined;
  } else {
    return pathParameters!.songId;
  }
};
