import { Response } from "express";
import { Contract, ExtractedData } from "../models";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";
import geminiService from "../services/gemini.service";

// Run AI extraction on contract
export const runAIExtraction = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    // Find contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    }).populate("extractedDataId");

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    // Check if text extraction is complete
    const extractedData: any = contract.extractedDataId;

    if (!extractedData) {
      throw new AppError(
        "Text extraction not found. Please run text extraction first.",
        400
      );
    }

    if (extractedData.extractionStatus !== "completed") {
      throw new AppError(
        `Text extraction is ${extractedData.extractionStatus}. Please wait for it to complete.`,
        400
      );
    }

    if (!extractedData.rawText || extractedData.rawText.length < 10) {
      throw new AppError("No text available for AI extraction", 400);
    }

    // Check if AI extraction already completed
    if (
      extractedData.parties?.length > 0 ||
      extractedData.clauses?.length > 0
    ) {
      return sendSuccess(
        res,
        {
          message: "AI extraction already completed",
          extraction: {
            parties: extractedData.parties,
            dates: {
              effective: extractedData.effectiveDate,
              termination: extractedData.terminationDate,
              renewal: extractedData.renewalDate,
            },
            amounts: extractedData.amounts,
            clauses: extractedData.clauses,
          },
        },
        "AI extraction already completed"
      );
    }

    // Update status to processing
    extractedData.extractionStatus = "processing";
    await extractedData.save();

    // Return immediately
    res.status(202).json({
      success: true,
      message: "AI extraction started. This may take a minute.",
      data: {
        extractionId: extractedData._id,
        status: "processing",
      },
    });

    // Process in background
    processAIExtraction(
      (contract._id as any).toString(),
      extractedData._id.toString(),
      extractedData.rawText
    );
  }
);

// Background AI extraction processing
async function processAIExtraction(
  contractId: string,
  extractionId: string,
  rawText: string
) {
  try {
    console.log(`🤖 Starting AI extraction for contract ${contractId}`);

    // Run Gemini extraction
    const aiResult = await geminiService.extractContractFields(rawText);

    // Update extracted data
    const extractedData = await ExtractedData.findById(extractionId);
    if (!extractedData) {
      console.error("Extracted data not found");
      return;
    }

    // Map parties
    extractedData.parties = aiResult.parties.map((p) => ({
      value: `${p.name} (${p.role})`,
      confidence: p.confidence,
      sourceSpan: {
        text: p.sourceText,
      },
    }));

    // Map dates
    const effectiveDateObj = aiResult.dates.find((d) =>
      d.type.toLowerCase().includes("effective")
    );
    const terminationDateObj = aiResult.dates.find(
      (d) =>
        d.type.toLowerCase().includes("termination") ||
        d.type.toLowerCase().includes("end")
    );
    const renewalDateObj = aiResult.dates.find((d) =>
      d.type.toLowerCase().includes("renewal")
    );

    if (effectiveDateObj) {
      extractedData.effectiveDate = {
        value: new Date(effectiveDateObj.date),
        confidence: effectiveDateObj.confidence,
        sourceSpan: {
          text: effectiveDateObj.sourceText,
        },
      };
    }

    if (terminationDateObj) {
      extractedData.terminationDate = {
        value: new Date(terminationDateObj.date),
        confidence: terminationDateObj.confidence,
        sourceSpan: {
          text: terminationDateObj.sourceText,
        },
      };
    }

    if (renewalDateObj) {
      extractedData.renewalDate = {
        value: new Date(renewalDateObj.date),
        confidence: renewalDateObj.confidence,
        sourceSpan: {
          text: renewalDateObj.sourceText,
        },
      };
    }

    // Map amounts
    extractedData.amounts = aiResult.amounts.map((a) => ({
      value: `${a.currency} ${a.value} - ${a.description}`,
      confidence: a.confidence,
      sourceSpan: {
        text: a.sourceText,
      },
    }));

    // Map clauses
    extractedData.clauses = aiResult.clauses.map((c) => ({
      clauseType: c.type,
      title: c.title,
      content: c.content,
      confidence: c.confidence,
      sourceSpan: {
        text: c.sourceText,
        page: c.page,
      },
    }));

    extractedData.extractionStatus = "completed";
    extractedData.extractedAt = new Date();
    await extractedData.save();

    console.log(`✅ AI extraction completed for contract ${contractId}`);

    // Auto-generate tasks from extracted dates
    try {
      const taskGeneratorService = (await import("../services/taskGenerator.service")).default;
      const contract = await Contract.findById(contractId);
      if (contract) {
        await taskGeneratorService.generateTasksFromExtractedData({
          contractId: contract._id as any,
          organizationId: contract.organizationId,
          createdBy: contract.uploadedBy,
          extractedData,
        });
      }
    } catch (taskError: any) {
      console.error("Failed to auto-generate tasks:", taskError.message);
      // Don't fail the extraction if task generation fails
    }

    // Auto-run compliance check
    try {
      const complianceService = (await import("../services/compliance.service")).default;
      const contract = await Contract.findById(contractId);
      if (contract) {
        const result = await complianceService.checkCompliance(
          contractId,
          contract.organizationId.toString(),
          extractedData
        );
        await complianceService.saveComplianceResult(
          contractId,
          contract.organizationId.toString(),
          result
        );
      }
    } catch (complianceError: any) {
      console.error("Failed to run compliance check:", complianceError.message);
      // Don't fail the extraction if compliance check fails
    }
  } catch (error: any) {
    console.error(`❌ AI extraction failed for contract ${contractId}:`, error);

    const extractedData = await ExtractedData.findById(extractionId);
    if (extractedData) {
      extractedData.extractionStatus = "failed";
      extractedData.extractionError = error.message;
      await extractedData.save();
    }
  }
}

// Get AI extraction results
export const getAIExtraction = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    // Find contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    }).populate("extractedDataId");

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const extractedData: any = contract.extractedDataId;

    if (!extractedData) {
      throw new AppError("No extraction data found", 404);
    }

    sendSuccess(res, {
      extractionId: extractedData._id,
      status: extractedData.extractionStatus,
      extraction: {
        parties: extractedData.parties || [],
        dates: {
          effective: extractedData.effectiveDate,
          termination: extractedData.terminationDate,
          renewal: extractedData.renewalDate,
        },
        amounts: extractedData.amounts || [],
        clauses: extractedData.clauses || [],
      },
      extractedAt: extractedData.extractedAt,
      error: extractedData.extractionError,
    });
  }
);

// Run risk analysis
export const runRiskAnalysis = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    // Find contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    }).populate("extractedDataId");

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const extractedData: any = contract.extractedDataId;

    if (!extractedData || !extractedData.rawText) {
      throw new AppError("No text available for risk analysis", 400);
    }

    // Run risk analysis
    const riskAnalysis = await geminiService.analyzeRisks(
      extractedData.rawText
    );

    // Update contract risk score
    if (riskAnalysis.riskScore !== undefined) {
      contract.riskScore = riskAnalysis.riskScore;
      await contract.save();
    }

    sendSuccess(res, {
      riskAnalysis,
      contractUpdated: {
        id: contract._id,
        riskScore: contract.riskScore,
      },
    });
  }
);
