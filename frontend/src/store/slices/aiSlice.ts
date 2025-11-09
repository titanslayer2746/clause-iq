import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/client";

interface ExtractionData {
  extractionId: string;
  status: "pending" | "processing" | "completed" | "failed";
  rawText?: string;
  pageCount?: number;
  qualityFlag?: "low" | "medium" | "high";
  extractedAt?: string;
  error?: string;
}

interface AIExtractionData {
  parties?: any[];
  dates?: any[];
  amounts?: any[];
  clauses?: any[];
  summary?: string;
}

interface RiskAnalysis {
  riskScore: number;
  risks: Array<{
    type: string;
    severity: string;
    description: string;
    recommendation: string;
    sourceText: string;
  }>;
  missingClauses?: string[];
  complianceIssues?: string[];
}

interface AIState {
  extraction: {
    [contractId: string]: ExtractionData;
  };
  aiData: {
    [contractId: string]: AIExtractionData;
  };
  riskAnalysis: {
    [contractId: string]: RiskAnalysis;
  };
  loading: boolean;
  error: string | null;
}

const initialState: AIState = {
  extraction: {},
  aiData: {},
  riskAnalysis: {},
  loading: false,
  error: null,
};

// Text Extraction thunks
export const extractText = createAsyncThunk(
  "ai/extractText",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/extraction/contracts/${contractId}/extract`
      );
      return { contractId, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Text extraction failed"
      );
    }
  }
);

export const getExtractionStatus = createAsyncThunk(
  "ai/getExtractionStatus",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/extraction/contracts/${contractId}/extraction`
      );
      return { contractId, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get extraction status"
      );
    }
  }
);

// AI Extraction thunks
export const runAIExtraction = createAsyncThunk(
  "ai/runAIExtraction",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ai/contracts/${contractId}/extract`);
      return { contractId, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "AI extraction failed"
      );
    }
  }
);

export const getAIExtraction = createAsyncThunk(
  "ai/getAIExtraction",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ai/contracts/${contractId}/extraction`);
      return { contractId, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get AI extraction"
      );
    }
  }
);

// Risk Analysis thunk
export const runRiskAnalysis = createAsyncThunk(
  "ai/runRiskAnalysis",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ai/contracts/${contractId}/risks`);
      return { contractId, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Risk analysis failed"
      );
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExtractionData: (state, action: PayloadAction<string>) => {
      const contractId = action.payload;
      delete state.extraction[contractId];
      delete state.aiData[contractId];
      delete state.riskAnalysis[contractId];
    },
  },
  extraReducers: (builder) => {
    // Extract text
    builder
      .addCase(extractText.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(extractText.fulfilled, (state, action) => {
        state.loading = false;
        state.extraction[action.payload.contractId] = action.payload.data;
      })
      .addCase(extractText.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get extraction status
    builder
      .addCase(getExtractionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExtractionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.extraction[action.payload.contractId] = action.payload.data;
      })
      .addCase(getExtractionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Run AI extraction
    builder
      .addCase(runAIExtraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runAIExtraction.fulfilled, (state, action) => {
        state.loading = false;
        state.aiData[action.payload.contractId] = action.payload.data;
      })
      .addCase(runAIExtraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get AI extraction
    builder
      .addCase(getAIExtraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAIExtraction.fulfilled, (state, action) => {
        state.loading = false;
        state.aiData[action.payload.contractId] = action.payload.data;
      })
      .addCase(getAIExtraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Run risk analysis
    builder
      .addCase(runRiskAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runRiskAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.riskAnalysis[action.payload.contractId] =
          action.payload.data.riskAnalysis;
      })
      .addCase(runRiskAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearExtractionData } = aiSlice.actions;
export default aiSlice.reducer;

