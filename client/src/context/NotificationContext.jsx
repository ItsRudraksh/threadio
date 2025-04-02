import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import useShowToast from "../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import notificationSound from "../assets/sounds/message.mp3";

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
          fetch("/api/v1/notifications"),
          fetch("/api/v1/notifications/unread"),
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
  }, [socket]);

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(
        `/api/v1/notifications/mark-read/${notificationId}`,
        {
          method: "PUT",
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
      const res = await fetch("/api/v1/notifications/mark-all-read", {
        method: "PUT",
      });

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

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
