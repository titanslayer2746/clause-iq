import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";

interface Contract {
  id: string;
  title: string;
  vendor?: string;
  status: string;
  riskScore?: number;
  extractedDataId?: string;
  createdAt: string;
}

interface ContractsState {
  contracts: Contract[];
  currentContract: any | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: ContractsState = {
  contracts: [],
  currentContract: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchContracts = createAsyncThunk(
  "contracts/fetchContracts",
  async (
    params: { page?: number; limit?: number; status?: string; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/contracts", { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch contracts"
      );
    }
  }
);

export const fetchContractById = createAsyncThunk(
  "contracts/fetchContractById",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/contracts/${contractId}`);
      return response.data.data.contract;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch contract"
      );
    }
  }
);

export const uploadContract = createAsyncThunk(
  "contracts/uploadContract",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/contracts/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

export const updateContract = createAsyncThunk(
  "contracts/updateContract",
  async (
    { contractId, data }: { contractId: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/contracts/${contractId}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update contract"
      );
    }
  }
);

export const deleteContract = createAsyncThunk(
  "contracts/deleteContract",
  async (contractId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/contracts/${contractId}`);
      return contractId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete contract"
      );
    }
  }
);

const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentContract: (state) => {
      state.currentContract = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch contracts
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false;
        // Map _id to id for frontend compatibility
        state.contracts = action.payload.contracts.map((contract: any) => ({
          ...contract,
          id: contract._id || contract.id,
        }));
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch contract by ID
    builder
      .addCase(fetchContractById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContractById.fulfilled, (state, action) => {
        state.loading = false;
        // Map _id to id for frontend compatibility
        state.currentContract = {
          ...action.payload,
          id: action.payload._id || action.payload.id,
        };
      })
      .addCase(fetchContractById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upload contract
    builder
      .addCase(uploadContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadContract.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update contract
    builder
      .addCase(updateContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.loading = false;
        // Update in the list if present
        const index = state.contracts.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.contracts[index] = {
            ...action.payload,
            id: action.payload._id || action.payload.id,
          };
        }
        // Update current contract if it's the same one
        if (state.currentContract?.id === action.payload.id) {
          state.currentContract = {
            ...action.payload,
            id: action.payload._id || action.payload.id,
          };
        }
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete contract
    builder
      .addCase(deleteContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from list
        state.contracts = state.contracts.filter((c) => c.id !== action.payload);
        // Clear current contract if it was deleted
        if (state.currentContract?.id === action.payload) {
          state.currentContract = null;
        }
        // Update pagination
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentContract } = contractsSlice.actions;
export default contractsSlice.reducer;
