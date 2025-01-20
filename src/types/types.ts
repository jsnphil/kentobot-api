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
