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
