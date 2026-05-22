import type { NextFunction, Request, Response } from "express";
import config from "../config";
import jwt from "jsonwebtoken";
import type { JwtPayloadObject } from "../types";

export interface AuthRequest extends Request {
    user?: JwtPayloadObject;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.split(" ")[1]
    : authorizationHeader;

  if (!token) {
      return next({
          statusCode: 401,
          message: "Unauthorized",
          errors: "No token provided"
      });
  }

  try {
    const decoded = jwt.verify(token, config.secret as string) as JwtPayloadObject;
    req.user = decoded;
    next();
  } catch {
      next({
          statusCode: 401,
          message: "Unauthorized",
          errors: "Invalid token"
      });
  }
};
