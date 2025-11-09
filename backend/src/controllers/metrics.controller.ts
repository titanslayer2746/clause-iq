import { Response } from "express";
import { Contract, Task, ExtractedData, ChatMessage } from "../models";
import UsageMetrics from "../models/UsageMetrics";
import { AuthRequest } from "../types";
import { asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";

// Get usage metrics for organization
export const getUsageMetrics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const [
      contractsCount,
      tasksCount,
      extractionsCount,
      chatMessagesCount,
      usageMetrics,
    ] = await Promise.all([
      Contract.countDocuments({ organizationId: user.organizationId }),
      Task.countDocuments({ organizationId: user.organizationId }),
      ExtractedData.countDocuments({ organizationId: user.organizationId }),
      ChatMessage.countDocuments({ organizationId: user.organizationId }),
      UsageMetrics.find({ organizationId: user.organizationId })
        .sort({ periodStart: -1 })
        .limit(30),
    ]);

    // Calculate total AI usage
    const totalGeminiTokens = usageMetrics.reduce(
      (sum, m) => sum + (m.geminiTokensUsed || 0),
      0
    );

    sendSuccess(res, {
      contracts: contractsCount,
      tasks: tasksCount,
      extractions: extractionsCount,
      chatMessages: chatMessagesCount,
      geminiTokensUsed: totalGeminiTokens,
      recentMetrics: usageMetrics,
    });
  }
);

// Get admin dashboard metrics (Admin only)
export const getAdminMetrics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    if (user.role !== "Admin") {
      return sendSuccess(res, {
        message: "Admin access required",
      });
    }

    const [contracts, tasks, extractions, chatMessages] = await Promise.all([
      Contract.find({ organizationId: user.organizationId }).lean(),
      Task.find({ organizationId: user.organizationId }).lean(),
      ExtractedData.find({ organizationId: user.organizationId }).lean(),
      ChatMessage.find({ organizationId: user.organizationId }).lean(),
    ]);

    // Calculate risk distribution
    const riskDistribution = {
      high: contracts.filter((c: any) => (c.riskScore || 0) >= 70).length,
      medium: contracts.filter(
        (c: any) => (c.riskScore || 0) >= 40 && (c.riskScore || 0) < 70
      ).length,
      low: contracts.filter((c: any) => (c.riskScore || 0) < 40 && c.riskScore).length,
      unanalyzed: contracts.filter((c: any) => !c.riskScore).length,
    };

    // Calculate task status distribution
    const taskDistribution = {
      pending: tasks.filter((t: any) => t.status === "pending").length,
      in_progress: tasks.filter((t: any) => t.status === "in_progress").length,
      completed: tasks.filter((t: any) => t.status === "completed").length,
      cancelled: tasks.filter((t: any) => t.status === "cancelled").length,
    };

    sendSuccess(res, {
      overview: {
        totalContracts: contracts.length,
        totalTasks: tasks.length,
        totalExtractions: extractions.length,
        totalChatMessages: chatMessages.length,
      },
      riskDistribution,
      taskDistribution,
      recentActivity: {
        contractsThisMonth: contracts.filter(
          (c: any) =>
            new Date(c.createdAt).getMonth() === new Date().getMonth()
        ).length,
        tasksThisMonth: tasks.filter(
          (t: any) =>
            new Date(t.createdAt).getMonth() === new Date().getMonth()
        ).length,
      },
    });
  }
);

