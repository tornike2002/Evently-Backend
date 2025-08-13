import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: string;
}

export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    if (!token) {
      res.status(401).json({ message: "You are not logged in" });
      return;
    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;
      if (!roles.includes(decoded.role)) {
        res
          .status(403)
          .json({ message: "You are not authorized to access this resource" });
        return;
      }
      (req as any).user = decoded.id;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
  };
};
