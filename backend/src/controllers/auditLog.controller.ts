import { Response } from "express";
import AuditLog from "../models/AuditLog";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";
import { Contract } from "../models";

// Get audit logs for organization
export const getAuditLogs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { action, resourceType, userId, contractId, page = 1, limit = 50 } = req.query;

    const filter: any = { organizationId: user.organizationId };

    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (userId) filter.userId = userId;
    if (contractId) filter.contractId = contractId;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "email")
        .populate("contractId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    sendSuccess(res, {
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

// Get audit logs for a specific contract
export const getContractAuditLogs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;
    const { limit = 50 } = req.query;

    // Verify contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    });

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const logs = await AuditLog.find({ contractId })
      .populate("userId", "email")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    sendSuccess(res, { logs, total: logs.length });
  }
);

