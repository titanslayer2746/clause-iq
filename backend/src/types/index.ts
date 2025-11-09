import { Request } from "express";
import { IUser } from "../models";

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

// Common API response types
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query filters
export interface ContractFilters {
  organizationId: string;
  status?: string;
  search?: string;
  uploadedBy?: string;
  riskScore?: {
    min?: number;
    max?: number;
  };
}
