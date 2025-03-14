export interface ValidationResult<T> {
  success: boolean; // Indicates whether the operation was successful
  data?: T; // The resulting object, if applicable
  errors?: ValidationError[]; // List of validation or rule errors
}

export interface ValidationError {
  code: string; // A machine-readable error code
  message: string; // A user-friendly error message
  context?: any; // Optional additional context about the error
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export enum KentobotErrorCode {
  StreamAlreadyExists = 'STREAM_ALREADY_EXISTS',
  SystemError = 'SYSTEM_ERROR',
  StreamNotFound = 'STREAM_NOT_FOUND',
  SongInQueue = 'SONG_IN_QUEUE',
  UserRequestLimit = 'USER_REQUEST_LIMIT'
}
