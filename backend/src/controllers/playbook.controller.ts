import { Response } from "express";
import { PlaybookRule, ComplianceResult, Contract } from "../models";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";
import complianceService from "../services/compliance.service";

// Get all playbook rules for organization
export const getRules = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  
  const rules = await PlaybookRule.find({
    organizationId: user.organizationId,
  })
    .populate("createdBy", "email")
    .sort({ createdAt: -1 });

  sendSuccess(res, { rules });
});

// Create playbook rule
export const createRule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { name, description, ruleType, category, severity, config, recommendation } =
      req.body;

    const rule = await PlaybookRule.create({
      organizationId: user.organizationId,
      name,
      description,
      ruleType,
      category,
      severity,
      enabled: true,
      config,
      recommendation,
      createdBy: user._id,
    });

    const populatedRule = await PlaybookRule.findById(rule._id).populate(
      "createdBy",
      "email"
    );

    sendSuccess(res, { rule: populatedRule }, "Playbook rule created", 201);
  }
);

// Update playbook rule
export const updateRule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { ruleId } = req.params;

    const rule = await PlaybookRule.findOne({
      _id: ruleId,
      organizationId: user.organizationId,
    });

    if (!rule) {
      throw new AppError("Playbook rule not found", 404);
    }

    const updates = req.body;
    Object.assign(rule, updates);
    await rule.save();

    const populatedRule = await PlaybookRule.findById(rule._id).populate(
      "createdBy",
      "email"
    );

    sendSuccess(res, { rule: populatedRule }, "Playbook rule updated");
  }
);

// Delete playbook rule
export const deleteRule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { ruleId } = req.params;

    const rule = await PlaybookRule.findOne({
      _id: ruleId,
      organizationId: user.organizationId,
    });

    if (!rule) {
      throw new AppError("Playbook rule not found", 404);
    }

    await rule.deleteOne();

    sendSuccess(res, null, "Playbook rule deleted");
  }
);

// Run compliance check on a contract
export const runComplianceCheck = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    // Verify contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    }).populate("extractedDataId");

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const extractedData: any = contract.extractedDataId;

    if (!extractedData || extractedData.extractionStatus !== "completed") {
      throw new AppError(
        "Contract must have completed AI extraction before compliance check",
        400
      );
    }

    // Run compliance check
    const result = await complianceService.checkCompliance(
      contractId,
      user.organizationId.toString(),
      extractedData
    );

    // Save result
    const complianceResult = await complianceService.saveComplianceResult(
      contractId,
      user.organizationId.toString(),
      result
    );

    sendSuccess(res, { complianceResult }, "Compliance check completed");
  }
);

// Get compliance result for a contract
export const getComplianceResult = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    // Verify contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    });

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const complianceResult = await ComplianceResult.findOne({
      contractId,
    }).populate("deviations.ruleId", "name severity");

    if (!complianceResult) {
      throw new AppError("No compliance result found for this contract", 404);
    }

    sendSuccess(res, { complianceResult });
  }
);

// Get compliance statistics for organization
export const getComplianceStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const [totalRules, enabledRules, complianceResults] = await Promise.all([
      PlaybookRule.countDocuments({ organizationId: user.organizationId }),
      PlaybookRule.countDocuments({
        organizationId: user.organizationId,
        enabled: true,
      }),
      ComplianceResult.find({ organizationId: user.organizationId }),
    ]);

    const totalContracts = complianceResults.length;
    const passedContracts = complianceResults.filter((r) => r.passed).length;
    const averageScore =
      totalContracts > 0
        ? complianceResults.reduce((sum, r) => sum + r.score, 0) / totalContracts
        : 0;

    sendSuccess(res, {
      totalRules,
      enabledRules,
      totalContracts,
      passedContracts,
      failedContracts: totalContracts - passedContracts,
      averageScore: Math.round(averageScore),
    });
  }
);

