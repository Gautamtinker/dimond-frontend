import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
  socketConnected: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(
        (n) => n.status === "unread",
      ).length;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload,
      );
      if (notification) {
        notification.status = "read";
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.status = "read";
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n._id !== action.payload,
      );
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setSocketConnected,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
