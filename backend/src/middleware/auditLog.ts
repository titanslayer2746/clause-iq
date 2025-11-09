import { NextFunction } from "express";
import AuditLog from "../models/AuditLog";
import { AuthRequest } from "../types";

interface AuditLogOptions {
  action: string;
  resourceType: string;
  resourceId?: string;
  contractId?: string;
  changes?: Array<{
    field: string;
    oldValue?: any;
    newValue?: any;
  }>;
  metadata?: any;
}

/**
 * Middleware to log actions to audit log
 */
export const logAudit = (options: AuditLogOptions) => {
  return async (req: AuthRequest, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next();
      }

      // Create audit log entry
      await AuditLog.create({
        organizationId: user.organizationId,
        userId: user._id,
        action: options.action,
        resourceType: options.resourceType,
        resourceId:
          options.resourceId || req.params.id || req.params.contractId,
        contractId: options.contractId || req.params.contractId,
        changes: options.changes,
        metadata: options.metadata,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      next();
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // Don't fail the request if audit logging fails
      next();
    }
  };
};

/**
 * Helper function to create audit log manually
 */
export const createAuditLog = async (
  organizationId: string,
  options: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    contractId?: string;
    changes?: any[];
    metadata?: any;
  }
) => {
  try {
    await AuditLog.create({
      organizationId,
      ...options,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};
