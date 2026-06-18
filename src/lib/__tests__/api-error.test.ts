import { describe, it, expect } from "vitest";
import { AppError, UnauthorizedError, NotFoundError, ValidationError, ConflictError, isAppError } from "../api-error";

describe("AppError", () => {
  it("creates error with default status 500", () => {
    const err = new AppError("Algo salió mal");
    expect(err.message).toBe("Algo salió mal");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBeUndefined();
  });

  it("creates error with custom status and code", () => {
    const err = new AppError("No encontrado", 404, "NOT_FOUND");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });
});

describe("UnauthorizedError", () => {
  it("creates with 401 status", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("uses custom message", () => {
    const err = new UnauthorizedError("Acceso denegado");
    expect(err.message).toBe("Acceso denegado");
  });
});

describe("NotFoundError", () => {
  it("creates with 404 status", () => {
    const err = new NotFoundError("Estudio");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toContain("Estudio");
  });
});

describe("ValidationError", () => {
  it("creates with 400 status", () => {
    const err = new ValidationError("Campo requerido");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
  });
});

describe("ConflictError", () => {
  it("creates with 409 status", () => {
    const err = new ConflictError("El archivo ya existe");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });
});

describe("isAppError", () => {
  it("returns true for AppError instances", () => {
    expect(isAppError(new AppError("test"))).toBe(true);
    expect(isAppError(new UnauthorizedError())).toBe(true);
  });

  it("returns false for regular Error", () => {
    expect(isAppError(new Error("test"))).toBe(false);
  });

  it("returns false for non-errors", () => {
    expect(isAppError("string")).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError({})).toBe(false);
  });
});
