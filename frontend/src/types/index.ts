export interface User {
  id: string;
  email: string;
  role: "Admin" | "Legal" | "Viewer";
  organizationId: string;
}

export interface Contract {
  id: string;
  title: string;
  vendor?: string;
  description?: string;
  status: "Pending" | "Reviewed" | "Approved" | "Rejected" | "Expired";
  riskScore?: number;
  fileAssetId: string;
  extractedDataId?: string;
  uploadedBy: string;
  organizationId: string;
  tags?: string[];
  metadata?: {
    contractType?: string;
    department?: string;
    value?: number;
    currency?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedField {
  value: string | number | Date;
  confidence: number;
  sourceSpan?: {
    text: string;
    page?: number;
    startLine?: number;
    endLine?: number;
  };
}

export interface ExtractedClause {
  clauseType: string;
  title: string;
  content: string;
  confidence: number;
  sourceSpan?: {
    text: string;
    page?: number;
  };
  tags?: string[];
}

export interface ExtractedData {
  id: string;
  contractId: string;
  rawText: string;
  pageCount: number;
  qualityFlag: "low" | "medium" | "high";
  parties?: ExtractedField[];
  effectiveDate?: ExtractedField;
  terminationDate?: ExtractedField;
  renewalDate?: ExtractedField;
  amounts?: ExtractedField[];
  clauses?: ExtractedClause[];
  extractionStatus: "pending" | "processing" | "completed" | "failed";
  extractionError?: string;
  extractedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  createdBy: string;
  members: User[];
  settings?: {
    allowedDomains?: string[];
    defaultRole?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
