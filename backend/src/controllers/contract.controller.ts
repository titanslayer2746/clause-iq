import { Response } from "express";
import fs from "fs";
import { Contract, FileAsset, ExtractedData } from "../models";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";
import cloudinaryService from "../services/cloudinary.service";
import extractionService from "../services/extraction.service";

// Upload contract with text extraction
export const uploadContract = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { title, vendor, description } = req.body;

    // Check if file exists
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const file = req.file;

    try {
      console.log("\n=== Starting Contract Upload Flow ===");
      console.log(`📄 File: ${file.originalname} (${file.mimetype})`);

      // STEP 1: Extract text from the uploaded file BEFORE uploading to Cloudinary
      console.log("\n🔍 STEP 1: Extracting text from uploaded file...");
      let extractionResult;
      try {
        extractionResult = await extractionService.extractText(
          file.path,
          file.mimetype
        );
        console.log(`✅ Text extracted: ${extractionResult.rawText.length} characters`);
        console.log(`   Method: ${extractionResult.extractionMethod}`);
        console.log(`   Quality: ${extractionResult.qualityFlag}`);
        console.log(`   Pages: ${extractionResult.pageCount}`);
      } catch (extractionError: any) {
        console.warn(`⚠️ Text extraction failed: ${extractionError.message}`);
        console.log(`   Continuing with upload, text extraction can be retried later`);
        // Set default extraction result
        extractionResult = {
          rawText: `[Extraction Failed] ${extractionError.message}`,
          pageCount: 0,
          qualityFlag: "low" as const,
          extractionMethod: "native" as const,
        };
      }

      // STEP 2: Upload to Cloudinary (for storage and display only)
      console.log("\n📤 STEP 2: Uploading to Cloudinary...");
      const uploadResult = await cloudinaryService.uploadFile(file.path);
      console.log(`✅ Uploaded to Cloudinary: ${uploadResult.url}`);

      // STEP 3: Create FileAsset record
      console.log("\n💾 STEP 3: Creating database records...");
      const fileAsset = await FileAsset.create({
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        cloudinaryUrl: uploadResult.url,
        cloudinaryPublicId: uploadResult.publicId,
        pageCount: extractionResult.pageCount || uploadResult.pages || 0,
        uploadedBy: user._id,
        organizationId: user.organizationId,
      });

      // STEP 4: Create Contract record first (without extractedDataId for now)
      const contract = await Contract.create({
        title: title || file.originalname.replace(/\.[^/.]+$/, ""),
        vendor: vendor || undefined,
        description: description || undefined,
        status: "Pending",
        fileAssetId: fileAsset._id,
        uploadedBy: user._id,
        organizationId: user.organizationId,
      });
      console.log(`✅ Contract created: ${contract._id}`);

      // STEP 5: Create ExtractedData record with the extracted text
      const extractedData = await ExtractedData.create({
        contractId: contract._id,
        rawText: extractionResult.rawText,
        pageCount: extractionResult.pageCount,
        qualityFlag: extractionResult.qualityFlag,
        extractionStatus: "completed", // Text extraction is complete
        extractedAt: new Date(),
      });
      console.log(`✅ ExtractedData created: ${extractedData._id}`);

      // STEP 6: Link extractedData to contract
      contract.extractedDataId = extractedData._id as any;
      await contract.save();

      // Delete local file after successful upload
      fs.unlinkSync(file.path);
      console.log(`🗑️ Cleaned up local file`);

      console.log("\n✅ === Contract Upload Flow Complete ===\n");

      sendSuccess(
        res,
        {
          contract: {
            id: contract._id,
            title: contract.title,
            vendor: contract.vendor,
            status: contract.status,
            fileUrl: uploadResult.url,
            createdAt: contract.createdAt,
            extractionStatus: "completed",
            textExtracted: extractionResult.rawText.length > 0,
          },
        },
        "Contract uploaded and text extracted successfully",
        201
      );
    } catch (error) {
      console.error("\n❌ Upload flow failed:", error);
      // Clean up local file if upload fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }
);

// Get all contracts
export const getContracts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query: any = {
      organizationId: user.organizationId,
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [contracts, total] = await Promise.all([
      Contract.find(query)
        .populate("uploadedBy", "email")
        .populate("fileAssetId", "fileName fileType cloudinaryUrl")
        .populate("assignedTo", "email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Contract.countDocuments(query),
    ]);

    sendSuccess(res, {
      contracts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

// Get contract by ID
export const getContractById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    })
      .populate("uploadedBy", "email role")
      .populate("fileAssetId")
      .populate("extractedDataId")
      .populate("assignedTo", "email");

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    sendSuccess(res, { contract });
  }
);

// Update contract
export const updateContract = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;
    const { title, vendor, description, status, tags, metadata } = req.body;

    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    });

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    // Update fields
    if (title) contract.title = title;
    if (vendor !== undefined) contract.vendor = vendor;
    if (description !== undefined) contract.description = description;
    if (status) contract.status = status;
    if (tags) contract.tags = tags;
    if (metadata) {
      contract.metadata = {
        ...contract.metadata,
        ...metadata,
      };
    }

    await contract.save();

    sendSuccess(res, { contract }, "Contract updated successfully");
  }
);

// Delete contract
export const deleteContract = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    }).populate("fileAssetId");

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    // Delete file from Cloudinary
    const fileAsset = await FileAsset.findById(contract.fileAssetId);
    if (fileAsset) {
      await cloudinaryService.deleteFile(fileAsset.cloudinaryPublicId);
      await FileAsset.findByIdAndDelete(fileAsset._id);
    }

    // Delete contract
    await Contract.findByIdAndDelete(contractId);

    sendSuccess(res, null, "Contract deleted successfully");
  }
);
