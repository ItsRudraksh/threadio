import {
  Box,
  Circle,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Spinner,
  Text,
  Tooltip,
  Flex,
  Button,
  Divider,
} from "@chakra-ui/react";
import { FaBell } from "react-icons/fa";
import { useNotifications } from "../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NotificationIcon = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnChatPage, setIsOnChatPage] = useState(false);

  // Check if we're on the chat page to filter notifications
  useEffect(() => {
    setIsOnChatPage(location.pathname === "/chat");
  }, [location]);

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "like":
      case "reply":
        if (notification.post) {
          navigate(
            `/${notification.sender.username}/post/${notification.post}`
          );
        }
        break;
      case "follow":
        navigate(`/${notification.sender.username}`);
        break;
      case "message":
        navigate("/chat");
        break;
      default:
        break;
    }
  };

  // Filter out chat notifications if we're on the chat page
  const filteredNotifications = isOnChatPage
    ? notifications.filter((notification) => notification.type !== "message")
    : notifications;

  return (
    <Box position="relative">
      <Menu>
        <Tooltip label="Notifications">
          <MenuButton>
            <Icon
              as={FaBell}
              boxSize={5}
            />
            {unreadCount > 0 && (
              <Circle
                bg="red.500"
                color="white"
                size="18px"
                position="absolute"
                top="-8px"
                right="-8px"
                fontSize="xs"
                fontWeight="bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Circle>
            )}
          </MenuButton>
        </Tooltip>
        <Portal>
          <MenuList
            bg="gray.dark"
            border="1px solid"
            borderColor="gray.light"
            minW="350px"
            maxH="450px"
            overflowY="auto">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              p={2}
              borderBottom="1px solid"
              borderColor="gray.light">
              <Text fontWeight="bold">Notifications</Text>
              <Flex gap={2}>
                {unreadCount > 0 && (
                  <Button
                    size="xs"
                    onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                {filteredNotifications.length > 0 && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={clearAllNotifications}>
                    Clear all
                  </Button>
                )}
              </Flex>
            </Flex>

            {loading ? (
              <Flex
                justify="center"
                p={4}>
                <Spinner size="md" />
              </Flex>
            ) : filteredNotifications.length === 0 ? (
              <MenuItem _hover={{ bg: "gray.700" }}>
                No notifications yet
              </MenuItem>
            ) : (
              filteredNotifications.map((notification) => (
                <MenuItem
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  _hover={{ bg: "gray.700" }}
                  bg={!notification.read ? "gray.700" : "gray.dark"}
                  borderLeft={!notification.read ? "3px solid" : "none"}
                  borderLeftColor={!notification.read ? "blue.400" : "none"}
                  p={3}>
                  <Flex
                    direction="column"
                    gap={1}>
                    <Text>{notification.text}</Text>
                    <Text
                      fontSize="xs"
                      color="gray.400">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </Text>
                  </Flex>
                </MenuItem>
              ))
            )}
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export default NotificationIcon;
