import { Request, Response, NextFunction } from 'express'
import { ZodError, ZodType } from 'zod'

export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: error.message,
          errors: error.issues.map((issue) => ({
            path: issue.path.join('.'),
          })),
        })
        return
      } else {
        res.status(400).json({
          message: 'Validation error',
        })
        return
      }
    }
  }