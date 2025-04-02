import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Flex,
  Avatar,
  Input,
  Spinner,
  Box,
  Divider,
  Image,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { FaPaperPlane } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const SharePostModal = ({ isOpen, onClose, post }) => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const currentUser = useRecoilValue(userAtom);
  const showToast = useShowToast();

  // Search for users when searchText changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchText.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/users/search?search=${searchText}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        // Handle different response formats - ensure we have an array
        const usersArray = Array.isArray(data)
          ? data
          : data.users || data.allUsers || [];

        // Filter out the current user
        const filteredUsers = usersArray.filter(
          (user) => user._id !== currentUser._id
        );
        setUsers(filteredUsers);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (searchText) searchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, showToast, currentUser._id]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUsers([]);
    setSearchText("");
  };

  const handleShare = async () => {
    if (!selectedUser) {
      showToast("Error", "Please select a user to share with", "error");
      return;
    }

    setSharing(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId: selectedUser._id,
            message: message,
            sharedPostId: post._id,
          }),
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Post shared successfully", "success");
      setSelectedUser(null);
      setMessage("");
      onClose();
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSharing(false);
    }
  };

  // Render post preview
  const renderPostPreview = () => {
    if (!post) return null;

    return (
      <Box
        my={4}
        p={3}
        borderWidth="1px"
        borderRadius="md"
        bg="gray.800">
        <Flex
          align="center"
          mb={2}>
          <Avatar
            src={post.postedBy?.profilePic}
            name={post.postedBy?.name || post.postedBy?.username}
            size="sm"
            mr={2}
          />
          <Text fontWeight="bold">{post.postedBy?.username}</Text>
          <Text
            fontSize="xs"
            color="gray.500"
            ml={2}>
            {post.createdAt &&
              formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
          </Text>
        </Flex>
        <Text mb={2}>{post.text}</Text>
        {post.img && (
          <Image
            src={post.img}
            borderRadius="md"
            maxH="200px"
            objectFit="cover"
            alt="Post image"
          />
        )}
      </Box>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md">
      <ModalOverlay />
      <ModalContent bg="gray.dark">
        <ModalHeader>Share Post</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {renderPostPreview()}

          <Divider my={3} />

          {selectedUser ? (
            <Flex
              align="center"
              mb={4}>
              <Avatar
                src={selectedUser.profilePic}
                name={selectedUser.username}
                size="sm"
                mr={2}
              />
              <Text fontWeight="bold">{selectedUser.username}</Text>
              <Button
                size="xs"
                ml="auto"
                variant="ghost"
                colorScheme="red"
                onClick={() => setSelectedUser(null)}>
                Change
              </Button>
            </Flex>
          ) : (
            <Box mb={4}>
              <Text mb={2}>Search for a user to share with:</Text>
              <Input
                placeholder="Search users..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                mb={2}
              />

              {loading ? (
                <Flex
                  justify="center"
                  my={4}>
                  <Spinner size="md" />
                </Flex>
              ) : (
                users.length > 0 && (
                  <Box
                    maxH="200px"
                    overflowY="auto">
                    {users.map((user) => (
                      <Flex
                        key={user._id}
                        align="center"
                        p={2}
                        _hover={{ bg: "gray.700" }}
                        cursor="pointer"
                        onClick={() => handleSelectUser(user)}
                        borderRadius="md">
                        <Avatar
                          src={user.profilePic}
                          name={user.username}
                          size="sm"
                          mr={2}
                        />
                        <Text fontWeight="bold">{user.username}</Text>
                      </Flex>
                    ))}
                  </Box>
                )
              )}
            </Box>
          )}

          {selectedUser && (
            <Box>
              <Text mb={2}>Add a message (optional):</Text>
              <Input
                placeholder="Write a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="gray"
            mr={3}
            onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleShare}
            isLoading={sharing}
            isDisabled={!selectedUser}
            leftIcon={<FaPaperPlane />}>
            Share
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SharePostModal;
