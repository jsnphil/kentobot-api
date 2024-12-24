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
