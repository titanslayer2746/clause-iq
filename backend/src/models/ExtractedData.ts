import mongoose, { Schema, Document } from "mongoose";

export interface ISourceSpan {
  text: string;
  page?: number;
  startLine?: number;
  endLine?: number;
}

export interface IExtractedField {
  value: string | number | Date;
  confidence: number;
  sourceSpan?: ISourceSpan;
}

export interface IExtractedClause {
  clauseType: string;
  title: string;
  content: string;
  confidence: number;
  sourceSpan?: ISourceSpan;
  tags?: string[];
}

export interface IExtractedData extends Document {
  contractId: mongoose.Types.ObjectId;
  rawText: string;
  pageCount: number;
  qualityFlag: "low" | "medium" | "high";
  parties?: IExtractedField[];
  effectiveDate?: IExtractedField;
  terminationDate?: IExtractedField;
  renewalDate?: IExtractedField;
  amounts?: IExtractedField[];
  clauses?: IExtractedClause[];
  extractionStatus: "pending" | "processing" | "completed" | "failed";
  extractionError?: string;
  extractedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SourceSpanSchema = new Schema<ISourceSpan>(
  {
    text: String,
    page: Number,
    startLine: Number,
    endLine: Number,
  },
  { _id: false }
);

const ExtractedFieldSchema = new Schema<IExtractedField>(
  {
    value: Schema.Types.Mixed,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    sourceSpan: SourceSpanSchema,
  },
  { _id: false }
);

const ExtractedClauseSchema = new Schema<IExtractedClause>(
  {
    clauseType: String,
    title: String,
    content: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    sourceSpan: SourceSpanSchema,
    tags: [String],
  },
  { _id: false }
);

const ExtractedDataSchema = new Schema<IExtractedData>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      unique: true,
      index: true,
    },
    rawText: {
      type: String,
      default: "",
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    qualityFlag: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    parties: [ExtractedFieldSchema],
    effectiveDate: ExtractedFieldSchema,
    terminationDate: ExtractedFieldSchema,
    renewalDate: ExtractedFieldSchema,
    amounts: [ExtractedFieldSchema],
    clauses: [ExtractedClauseSchema],
    extractionStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    extractionError: String,
    extractedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// Note: contractId already has index from schema definition
ExtractedDataSchema.index({ extractionStatus: 1 });

export default mongoose.model<IExtractedData>(
  "ExtractedData",
  ExtractedDataSchema
);
