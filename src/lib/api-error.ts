export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Demasiadas solicitudes. Intentá de nuevo en un minuto.") {
    super(message, 429, "RATE_LIMIT");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No tenés permisos para realizar esta acción.") {
    super(message, 403, "FORBIDDEN");
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
