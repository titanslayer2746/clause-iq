import { Response } from "express";
import { Contract, ExtractedData } from "../models";
import { AuthRequest } from "../types";
import { asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";

// Advanced search with complex filters
export const advancedSearch = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const {
      query,
      status,
      riskLevel,
      tags,
      vendor,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      clauseType,
      page = 1,
      limit = 20,
    } = req.query;

    const filter: any = { organizationId: user.organizationId };

    // Basic filters
    if (status) filter.status = status;
    if (vendor) filter.vendor = { $regex: vendor, $options: "i" };
    if (tags) {
      const tagArray = (tags as string).split(",");
      filter.tags = { $in: tagArray };
    }

    // Risk level filter
    if (riskLevel) {
      if (riskLevel === "high") {
        filter.riskScore = { $gte: 70 };
      } else if (riskLevel === "medium") {
        filter.riskScore = { $gte: 40, $lt: 70 };
      } else if (riskLevel === "low") {
        filter.riskScore = { $lt: 40 };
      }
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Text search in title and description
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const contractsQuery = Contract.find(filter)
      .populate("uploadedBy", "email")
      .populate("fileAssetId")
      .populate("assignedTo", "email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const [contracts] = await Promise.all([
      contractsQuery,
      Contract.countDocuments(filter),
    ]);

    // If searching by clause type or amount, filter by extracted data
    let filteredContracts = contracts;

    if (clauseType || minAmount || maxAmount) {
      const contractsWithExtraction = await Promise.all(
        contracts.map(async (contract) => {
          if (!contract.extractedDataId) return null;

          const extractedData = await ExtractedData.findById(
            contract.extractedDataId
          );
          if (!extractedData) return null;

          // Filter by clause type
          if (clauseType) {
            const hasClause = extractedData.clauses?.some((clause) =>
              clause.clauseType
                ?.toLowerCase()
                .includes((clauseType as string).toLowerCase())
            );
            if (!hasClause) return null;
          }

          // Filter by amount range
          if (minAmount || maxAmount) {
            const hasAmountInRange = extractedData.amounts?.some((amount) => {
              const value = parseFloat(amount.value?.toString() || "0");
              if (minAmount && value < Number(minAmount)) return false;
              if (maxAmount && value > Number(maxAmount)) return false;
              return true;
            });
            if (!hasAmountInRange) return null;
          }

          return contract;
        })
      );

      filteredContracts = contractsWithExtraction.filter(
        (c) => c !== null
      ) as any[];
    }

    sendSuccess(res, {
      contracts: filteredContracts,
      pagination: {
        total: filteredContracts.length,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(filteredContracts.length / Number(limit)),
      },
    });
  }
);

// Search within contract text
export const searchInContract = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;
    const { query } = req.query;

    if (!query) {
      return sendSuccess(res, { matches: [] });
    }

    // Verify contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    }).populate("extractedDataId");

    if (!contract) {
      return sendSuccess(res, { matches: [] });
    }

    const extractedData: any = contract.extractedDataId;
    if (!extractedData) {
      return sendSuccess(res, { matches: [] });
    }

    const matches: any[] = [];
    const searchRegex = new RegExp(query as string, "gi");

    // Search in raw text
    if (extractedData.rawText) {
      const text = extractedData.rawText;
      let match;
      while ((match = searchRegex.exec(text)) !== null) {
        const start = Math.max(0, match.index - 100);
        const end = Math.min(
          text.length,
          match.index + (query as string).length + 100
        );
        const snippet = text.substring(start, end);

        matches.push({
          type: "text",
          snippet: `...${snippet}...`,
          position: match.index,
        });

        if (matches.length >= 10) break; // Limit to 10 matches
      }
    }

    // Search in clauses
    extractedData.clauses?.forEach((clause: any) => {
      const clauseText = `${clause.title} ${clause.content}`;
      if (searchRegex.test(clauseText)) {
        matches.push({
          type: "clause",
          clauseType: clause.clauseType,
          title: clause.title,
          content: clause.content,
          page: clause.sourceSpan?.page,
        });
      }
    });

    sendSuccess(res, { matches, total: matches.length });
  }
);
