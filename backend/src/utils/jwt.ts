import jwt from "jsonwebtoken";
import { IUser } from "../models";

export interface JwtPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: string;
}

const JWT_SECRET: string =
  process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: String(user._id),
    email: user.email,
    organizationId: user.organizationId.toString(),
    role: user.role,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
