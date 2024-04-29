/**
 * CustomError class
 * @class CustomError
 * @extends {Error}
 * @param {string} message - Error message
 * @param {number} code - Error code
 * @returns {CustomError} - CustomError object
 * @example
 * throw new CustomError("Error message", 500);
 * @example
 * throw new CustomError("Error message", 404);
 */
class CustomError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export default CustomError;
