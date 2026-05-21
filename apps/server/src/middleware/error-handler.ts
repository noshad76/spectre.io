import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: err.errors
    })
  }

  console.error(err)

  res.status(500).json({
    error: "Internal Server Error"
  })
}
