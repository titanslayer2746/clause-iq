import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/client";

export interface PlaybookRule {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  ruleType: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  config: any;
  recommendation?: string;
  createdBy: { email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceResult {
  id: string;
  contractId: string;
  score: number;
  passed: boolean;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  deviations: Array<{
    ruleId: string;
    ruleName: string;
    severity: string;
    message: string;
    recommendation?: string;
    affectedClause?: string;
  }>;
  analyzedAt: string;
}

interface PlaybookState {
  rules: PlaybookRule[];
  currentCompliance: ComplianceResult | null;
  stats: {
    totalRules: number;
    enabledRules: number;
    totalContracts: number;
    passedContracts: number;
    failedContracts: number;
    averageScore: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlaybookState = {
  rules: [],
  currentCompliance: null,
  stats: null,
  loading: false,
  error: null,
};

// Fetch all playbook rules
export const fetchRules = createAsyncThunk(
  "playbook/fetchRules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/playbook/rules");
      return response.data.data.rules;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch rules"
      );
    }
  }
);

// Create playbook rule
export const createRule = createAsyncThunk(
  "playbook/createRule",
  async (ruleData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/playbook/rules", ruleData);
      return response.data.data.rule;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create rule"
      );
    }
  }
);

// Update playbook rule
export const updateRule = createAsyncThunk(
  "playbook/updateRule",
  async (
    { ruleId, updates }: { ruleId: string; updates: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/playbook/rules/${ruleId}`, updates);
      return response.data.data.rule;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update rule"
      );
    }
  }
);

// Delete playbook rule
export const deleteRule = createAsyncThunk(
  "playbook/deleteRule",
  async (ruleId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/playbook/rules/${ruleId}`);
      return ruleId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete rule"
      );
    }
  }
);

// Run compliance check
export const runComplianceCheck = createAsyncThunk(
  "playbook/runComplianceCheck",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/playbook/contracts/${contractId}/check`);
      return response.data.data.complianceResult;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to run compliance check"
      );
    }
  }
);

// Get compliance result
export const getComplianceResult = createAsyncThunk(
  "playbook/getComplianceResult",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/playbook/contracts/${contractId}/result`);
      return response.data.data.complianceResult;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get compliance result"
      );
    }
  }
);

// Get compliance stats
export const fetchStats = createAsyncThunk(
  "playbook/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/playbook/stats");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);

const playbookSlice = createSlice({
  name: "playbook",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCompliance: (state) => {
      state.currentCompliance = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch rules
    builder
      .addCase(fetchRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRules.fulfilled,
        (state, action: PayloadAction<PlaybookRule[]>) => {
          state.loading = false;
          state.rules = action.payload;
        }
      )
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create rule
    builder
      .addCase(createRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createRule.fulfilled,
        (state, action: PayloadAction<PlaybookRule>) => {
          state.loading = false;
          state.rules.unshift(action.payload);
        }
      )
      .addCase(createRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update rule
    builder
      .addCase(updateRule.fulfilled, (state, action: PayloadAction<PlaybookRule>) => {
        const index = state.rules.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.rules[index] = action.payload;
        }
      });

    // Delete rule
    builder.addCase(
      deleteRule.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.rules = state.rules.filter((r) => r.id !== action.payload);
      }
    );

    // Run compliance check
    builder
      .addCase(runComplianceCheck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        runComplianceCheck.fulfilled,
        (state, action: PayloadAction<ComplianceResult>) => {
          state.loading = false;
          state.currentCompliance = action.payload;
        }
      )
      .addCase(runComplianceCheck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get compliance result
    builder
      .addCase(
        getComplianceResult.fulfilled,
        (state, action: PayloadAction<ComplianceResult>) => {
          state.currentCompliance = action.payload;
        }
      );

    // Fetch stats
    builder.addCase(fetchStats.fulfilled, (state, action: PayloadAction<any>) => {
      state.stats = action.payload;
    });
  },
});

export const { clearError, clearCompliance } = playbookSlice.actions;
export default playbookSlice.reducer;

