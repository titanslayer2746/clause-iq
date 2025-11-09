import { Response } from "express";
import { Contract, ExtractedData } from "../models";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";
import geminiService from "../services/gemini.service";

// AI Analysis - Run Gemini extraction on existing rawText
export const runAIAnalysis = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    console.log(`\n🤖 Starting AI Analysis for contract ${contractId}`);

    // Find contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    }).populate("extractedDataId");

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    // Check if extractedData exists
    if (!contract.extractedDataId) {
      throw new AppError("No extracted text found for this contract. Please upload the contract first.", 404);
    }

    const extractedData: any = contract.extractedDataId;

    // Check if rawText exists
    if (!extractedData.rawText || extractedData.rawText.trim().length === 0) {
      throw new AppError("No text content available for AI analysis. Text extraction may have failed.", 422);
    }

    console.log(`📝 Found rawText: ${extractedData.rawText.length} characters`);

    // Check if AI analysis already completed
    if (extractedData.parties && extractedData.parties.length > 0) {
      console.log(`✅ AI analysis already completed, returning existing data`);
      return sendSuccess(
        res,
        {
          extractedData,
          message: "AI analysis already completed. Returning existing structured data.",
        },
        "AI analysis already completed"
      );
    }

    // Mark as processing
    extractedData.extractionStatus = "processing";
    await extractedData.save();

    // Return immediately and process in background
    res.status(202).json({
      success: true,
      message: "AI analysis started. This may take 30-60 seconds.",
      data: {
        extractionId: extractedData._id,
        status: "processing",
      },
    });

    // Process AI analysis asynchronously
    processAIAnalysis(
      (contract._id as any).toString(),
      (extractedData._id as any).toString(),
      extractedData.rawText
    );
  }
);

// Background AI analysis function
async function processAIAnalysis(
  contractId: string,
  extractionId: string,
  rawText: string
) {
  try {
    console.log(`🤖 Running AI extraction on ${rawText.length} characters of text`);

    // Run Gemini AI extraction on the raw text
    const aiExtractedData = await geminiService.extractContractFields(rawText);

    console.log(`✅ AI extraction completed`);
    console.log(`   Parties: ${aiExtractedData.parties?.length || 0}`);
    console.log(`   Amounts: ${aiExtractedData.amounts?.length || 0}`);
    console.log(`   Clauses: ${aiExtractedData.clauses?.length || 0}`);

    // Map parties to IExtractedField format
    const mappedParties = aiExtractedData.parties?.map((party) => ({
      value: `${party.name} (${party.role})`,
      confidence: party.confidence,
      sourceSpan: {
        text: party.sourceText,
      },
    })) || [];

    // Map amounts to IExtractedField format
    const mappedAmounts = aiExtractedData.amounts?.map((amount) => ({
      value: `${amount.currency} ${amount.value} - ${amount.description}`,
      confidence: amount.confidence,
      sourceSpan: {
        text: amount.sourceText,
      },
    })) || [];

    // Map clauses to IExtractedClause format
    const mappedClauses = aiExtractedData.clauses?.map((clause) => ({
      clauseType: clause.type,
      title: clause.title,
      content: clause.content,
      confidence: clause.confidence,
      sourceSpan: {
        text: clause.sourceText,
        page: clause.page,
      },
    })) || [];

    // Extract and map dates from the dates array
    let effectiveDateField;
    let terminationDateField;
    let renewalDateField;

    if (aiExtractedData.dates && aiExtractedData.dates.length > 0) {
      for (const dateEntry of aiExtractedData.dates) {
        const dateType = dateEntry.type.toLowerCase();
        const mappedDate = {
          value: new Date(dateEntry.date),
          confidence: dateEntry.confidence,
          sourceSpan: {
            text: dateEntry.sourceText,
          },
        };

        if (dateType.includes('effective') || dateType.includes('start')) {
          effectiveDateField = mappedDate;
        } else if (dateType.includes('termination') || dateType.includes('end')) {
          terminationDateField = mappedDate;
        } else if (dateType.includes('renewal')) {
          renewalDateField = mappedDate;
        }
      }
    }

    // Update extracted data with AI results
    const extractedData = await ExtractedData.findById(extractionId);
    if (extractedData) {
      extractedData.parties = mappedParties;
      extractedData.effectiveDate = effectiveDateField;
      extractedData.terminationDate = terminationDateField;
      extractedData.renewalDate = renewalDateField;
      extractedData.amounts = mappedAmounts;
      extractedData.clauses = mappedClauses;
      extractedData.extractionStatus = "completed";
      await extractedData.save();

      console.log(`✅ AI analysis completed for contract ${contractId}`);

      // Auto-generate tasks from extracted dates
      try {
        const contract = await Contract.findById(contractId);
        if (contract) {
          const taskGeneratorService = (await import("../services/taskGenerator.service")).default;
          const generatedTasks = await taskGeneratorService.generateTasksFromExtractedData({
            contractId: contract._id as any,
            organizationId: contract.organizationId as any,
            createdBy: contract.uploadedBy as any,
            extractedData: extractedData as any,
          });
          
          if (generatedTasks.length > 0) {
            console.log(`✅ Generated ${generatedTasks.length} tasks for contract ${contractId}`);
          } else {
            console.log(`ℹ️ No tasks generated for contract ${contractId} (no future dates found)`);
          }
        }
      } catch (taskError: any) {
        console.error(`⚠️ Failed to generate tasks for contract ${contractId}:`, taskError.message);
        // Don't fail the entire AI analysis if task generation fails
      }
    }
  } catch (error: any) {
    console.error(
      `❌ AI analysis failed for contract ${contractId}:`,
      error
    );

    // Update status to failed
    const extractedData = await ExtractedData.findById(extractionId);
    if (extractedData) {
      extractedData.extractionStatus = "failed";
      extractedData.extractionError = error.message;
      await extractedData.save();
    }
  }
}

// Get extraction status and AI analysis progress
export const getExtractionStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    // Verify contract belongs to user's organization
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    });

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const extractedData = await ExtractedData.findOne({
      contractId: contract._id,
    });

    if (!extractedData) {
      throw new AppError("No extraction found for this contract", 404);
    }

    sendSuccess(res, {
      extractionId: extractedData._id,
      status: extractedData.extractionStatus,
      rawText: extractedData.rawText,
      pageCount: extractedData.pageCount,
      qualityFlag: extractedData.qualityFlag,
      extractedAt: extractedData.extractedAt,
      error: extractedData.extractionError,
      // AI analysis data
      parties: extractedData.parties,
      amounts: extractedData.amounts,
      clauses: extractedData.clauses,
      effectiveDate: extractedData.effectiveDate,
      terminationDate: extractedData.terminationDate,
      renewalDate: extractedData.renewalDate,
    });
  }
);
