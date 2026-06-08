import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDashboardNotifications,
  markAllNotificationsAsRead,
} from "../store/slices/dashboardSlice";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function Notifications() {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getDashboardNotifications(50));
  }, [dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      default:
        return "default";
    }
  };

  const getNotificationIcon = (type) => {
    return <NotificationsIcon color={getPriorityColor("medium")} />;
  };

  if (loading) {
    return <Typography>Loading notifications...</Typography>;
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Notifications</Typography>
        <Button
          variant="outlined"
          startIcon={<DoneAllIcon />}
          onClick={handleMarkAllRead}
        >
          Mark All as Read
        </Button>
      </Box>

      {notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <NotificationsIcon
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            No notifications
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {notifications.map((notification, index) => (
              <Box key={notification._id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor:
                      notification.status === "unread"
                        ? "action.hover"
                        : "inherit",
                  }}
                >
                  {getNotificationIcon(notification.type)}
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" component="span">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.priority}
                          color={getPriorityColor(notification.priority)}
                          size="small"
                        />
                        {notification.status === "unread" && (
                          <Chip label="New" color="error" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {notification.message}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
