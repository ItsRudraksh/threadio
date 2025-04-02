import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import useShowToast from "../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import notificationSound from "../assets/sounds/message.mp3";
import { useLocation } from "react-router-dom";

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const showToast = useShowToast();
  const user = useRecoilValue(userAtom);
  const location = useLocation();

  // Fetch notifications when user logs in
  useEffect(() => {
    const getNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [notifRes, countRes] = await Promise.all([
          fetch("http://localhost:5000/api/v1/notifications", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/api/v1/notifications/unread", {
            credentials: "include",
          }),
        ]);

        const [notifData, countData] = await Promise.all([
          notifRes.json(),
          countRes.json(),
        ]);

        if (notifRes.ok && countRes.ok) {
          setNotifications(notifData);
          setUnreadCount(countData.count);
        } else {
          throw new Error(notifData.error || countData.error);
        }
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    getNotifications();
  }, [user, showToast]);

  // Listen for new notifications
  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", (notification) => {
      // Don't show chat notifications if the user is on the chat page
      if (notification.type === "message" && location.pathname === "/chat") {
        return;
      }

      // Play sound if the window is not focused
      if (!document.hasFocus()) {
        const sound = new Audio(notificationSound);
        sound.play();
      }

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket, location.pathname]);

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/notifications/mark-read/${notificationId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/v1/notifications/mark-all-read",
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const clearAllNotifications = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/v1/notifications/clear-all",
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
