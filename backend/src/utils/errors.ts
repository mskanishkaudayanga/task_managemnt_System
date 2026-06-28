export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(message: string) {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class UnauthorizedError extends CustomError {
  statusCode = 401;

  constructor(message: string = 'Not authenticated') {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ForbiddenError extends CustomError {
  statusCode = 403;

  constructor(message: string = 'Access denied') {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(message: string = 'Resource not found') {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ConflictError extends CustomError {
  statusCode = 409;

  constructor(message: string) {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
