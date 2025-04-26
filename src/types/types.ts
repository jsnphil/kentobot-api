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
  UserRequestLimit = 'USER_REQUEST_LIMIT',
  SongNotFound = 'SONG_NOT_FOUND'
}
