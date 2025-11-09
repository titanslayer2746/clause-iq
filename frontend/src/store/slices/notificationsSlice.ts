import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/client";

export interface Notification {
  id: string;
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message: string;
  relatedContractId?: { id: string; title: string };
  relatedTaskId?: { id: string; title: string };
  link?: string;
  read: boolean;
  readAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (
    params: { read?: boolean; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/notifications", { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data.data.unreadCount;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch unread count"
      );
    }
  }
);

// Mark as read
export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data.data.notification;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as read"
      );
    }
  }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.patch("/notifications/mark-all-read");
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all as read"
      );
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete notification"
      );
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchNotifications.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.notifications = action.payload.notifications;
          state.unreadCount = action.payload.unreadCount;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchUnreadCount.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.unreadCount = action.payload;
        }
      )
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
        const index = state.notifications.findIndex(
          (n) => n.id === action.payload.id
        );
        if (index !== -1) {
          state.notifications[index] = action.payload;
          if (!action.payload.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });

    // Mark all as read
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
      state.unreadCount = 0;
    });

    // Delete notification
    builder.addCase(
      deleteNotification.fulfilled,
      (state, action: PayloadAction<string>) => {
        const notification = state.notifications.find(
          (n) => n.id === action.payload
        );
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
      }
    );
  },
});

export const { clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
