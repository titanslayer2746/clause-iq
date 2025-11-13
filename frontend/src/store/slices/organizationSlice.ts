import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";

interface Member {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

interface Organization {
  id: string;
  name: string;
  members: Member[];
  settings?: any;
  createdAt?: string;
}

interface OrganizationState {
  organization: Organization | null;
  members: Member[];
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  organization: null,
  members: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchOrganization = createAsyncThunk(
  "organization/fetchOrganization",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/organizations/current");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organization"
      );
    }
  }
);

export const fetchMembers = createAsyncThunk(
  "organization/fetchMembers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/organizations/members");
      return response.data.data.members;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch members"
      );
    }
  }
);

export const inviteMember = createAsyncThunk(
  "organization/inviteMember",
  async (data: { email: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/invite", data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send invitation"
      );
    }
  }
);

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch organization
    builder
      .addCase(fetchOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organization = action.payload;
      })
      .addCase(fetchOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch members
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Invite member
    builder
      .addCase(inviteMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteMember.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = organizationSlice.actions;
export default organizationSlice.reducer;
