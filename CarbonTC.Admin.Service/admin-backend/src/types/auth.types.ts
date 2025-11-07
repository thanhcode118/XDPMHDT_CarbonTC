import { Request } from "express";
import { UserRole } from "./enum";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
  };
}