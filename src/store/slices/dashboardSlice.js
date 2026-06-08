import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardAPI } from "../../services/api";

const initialState = {
  stats: null,
  notifications: [],
  upcomingDues: [],
  upcomingSaleDues: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

export const getDashboardStats = createAsyncThunk(
  "dashboard/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats",
      );
    }
  },
);

export const getDashboardNotifications = createAsyncThunk(
  "dashboard/getNotifications",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getNotifications(limit);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications",
      );
    }
  },
);

export const getUpcomingDues = createAsyncThunk(
  "dashboard/getUpcomingDues",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getUpcomingDues();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch upcoming dues",
      );
    }
  },
);

export const getUpcomingSaleDues = createAsyncThunk(
  "dashboard/getUpcomingSaleDues",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getUpcomingSaleDues();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch upcoming sale dues",
      );
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "dashboard/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await dashboardAPI.markNotificationAsRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as read",
      );
    }
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "dashboard/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await dashboardAPI.markAllNotificationsAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all as read",
      );
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Notifications
      .addCase(getDashboardNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.all || [];
        state.unreadCount =
          action.payload.all?.filter((n) => n.status === "unread").length || 0;
      })
      .addCase(getDashboardNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n._id === action.payload,
        );
        if (notification) {
          notification.status = "read";
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark All as Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.status = "read";
        });
        state.unreadCount = 0;
      })
      // Get Upcoming Dues
      .addCase(getUpcomingDues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUpcomingDues.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingDues = action.payload.notifications || [];
      })
      .addCase(getUpcomingDues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Upcoming Sale Dues
      .addCase(getUpcomingSaleDues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUpcomingSaleDues.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingSaleDues = action.payload.notifications || [];
      })
      .addCase(getUpcomingSaleDues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError, addNotification } = dashboardSlice.actions;
export default dashboardSlice.reducer;
