import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User, UserRole } from "../models";
import { AuthRequest } from "../types";
import { AppError } from "./errorHandler";

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new AppError("User not found", 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError("Email not verified", 403);
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Invalid token", 401));
    }
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403
      );
    }

    next();
  };
};

export const checkOrganization = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  // This middleware can be extended to check if user belongs to the organization
  // For now, we'll just ensure user has an organizationId
  if (!req.user.organizationId) {
    throw new AppError("No organization associated with user", 403);
  }

  next();
};
