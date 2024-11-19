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

export const iso8601ToSeconds = (isoDuration: string) => {
  const regex =
    /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const match = regex.exec(isoDuration);

  if (!match) {
    throw new Error('Invalid ISO 8601 duration format');
  }

  const [, years, months, weeks, days, hours, minutes, seconds] =
    match.map(Number);

  // Assuming 30 days per month and 365 days per year
  return (
    (years ?? 0) * 365 * 24 * 60 * 60 +
    (months ?? 0) * 30 * 24 * 60 * 60 +
    (weeks ?? 0) * 7 * 24 * 60 * 60 +
    (days ?? 0) * 24 * 60 * 60 +
    (hours ?? 0) * 60 * 60 +
    (minutes ?? 0) * 60 +
    (seconds ?? 0)
  );
};
