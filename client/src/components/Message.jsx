import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Skeleton,
  Text,
  useDisclosure,
  Link,
  Divider,
} from "@chakra-ui/react";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsTrash } from "react-icons/bs";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRef, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useSocket } from "../context/SocketContext";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const Message = ({ ownMessage, message, onDelete }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const showToast = useShowToast();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    onOpen();
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/${message._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.error) {
        return showToast("Error", data.error, "error");
      }

      // Emit socket event to notify the recipient about the deleted message
      if (socket) {
        socket.emit("messageDeleted", {
          messageId: message._id,
          recipientId: selectedConversation.userId,
        });
      }

      // Call the onDelete prop to remove the message from the UI
      onDelete(message._id, true);
      showToast("Success", "Message deleted", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const handlePostClick = (post) => {
    if (post && post.postedBy) {
      navigate(`/${post.postedBy.username}/post/${post._id}`);
    }
  };

  // Render a deleted message differently
  if (message.deleted) {
    return (
      <Flex
        gap={2}
        alignSelf={ownMessage ? "flex-end" : "flex-start"}
        alignItems="center">
        {!ownMessage && (
          <Avatar
            src={selectedConversation.userProfilePic}
            w="7"
            h={7}
          />
        )}
        <Text
          fontSize="sm"
          fontStyle="italic"
          color="gray.500"
          bg={ownMessage ? "gray.700" : "gray.600"}
          px={3}
          py={1}
          borderRadius="md">
          This message was deleted
        </Text>
        {ownMessage && (
          <Avatar
            src={user.profilePic}
            w="7"
            h={7}
          />
        )}
      </Flex>
    );
  }

  // Render shared post
  const SharedPostContent = () => {
    if (!message.sharedPost) return null;

    const post = message.sharedPost;

    return (
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={3}
        bg="gray.700"
        mt={2}
        mb={1}
        maxW="300px"
        cursor="pointer"
        onClick={() => handlePostClick(post)}
        _hover={{ bg: "gray.600" }}>
        <Flex
          alignItems="center"
          mb={2}>
          <Avatar
            size="xs"
            src={post.postedBy?.profilePic}
            mr={2}
          />
          <Text
            fontWeight="bold"
            fontSize="sm">
            {post.postedBy?.username}
          </Text>
          <Text
            fontSize="xs"
            color="gray.400"
            ml={2}>
            {post.createdAt &&
              formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
          </Text>
        </Flex>

        {post.text && (
          <Text
            fontSize="sm"
            mb={2}
            noOfLines={3}>
            {post.text}
          </Text>
        )}

        {post.img && (
          <Image
            src={post.img}
            borderRadius="md"
            maxH="150px"
            objectFit="cover"
            mt={2}
          />
        )}
      </Box>
    );
  };

  return (
    <>
      {ownMessage ? (
        <Flex
          overflowX={"hidden"}
          gap={2}
          alignSelf={"flex-end"}
          position="relative"
          pl={6}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}>
          <Menu
            placement="left-start"
            closeOnBlur={true}
            isLazy
            strategy="fixed"
            gutter={8}>
            {isHovering && (
              <MenuButton
                as={IconButton}
                icon={<BsThreeDotsVertical />}
                size="xs"
                colorScheme="gray"
                variant="ghost"
                position="absolute"
                top="2px"
                left="0"
                opacity={0.7}
                _hover={{ opacity: 1 }}
                aria-label="Message options"
                isRound
              />
            )}
            <Portal>
              <MenuList
                minW="120px"
                bg="gray.700"
                borderColor="gray.600">
                <MenuItem
                  icon={<BsTrash />}
                  color="red.400"
                  _hover={{ bg: "gray.600" }}
                  onClick={handleDeleteClick}>
                  Delete
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>

          <Flex
            flexDirection="column"
            maxW="350px">
            {message.text && (
              <Flex
                bg={"green.800"}
                maxW={"350px"}
                p={1}
                borderRadius={"md"}>
                <Text color={"white"}>{message.text}</Text>
                <Box
                  alignSelf={"flex-end"}
                  ml={1}
                  color={message.seen ? "blue.400" : ""}
                  fontWeight={"bold"}>
                  <BsCheck2All size={16} />
                </Box>
              </Flex>
            )}

            {message.sharedPost && <SharedPostContent />}

            {message.img && !imgLoaded && (
              <Flex
                mt={message.text ? 2 : 0}
                w={"200px"}
                position="relative">
                <Image
                  src={message.img}
                  hidden
                  onLoad={() => setImgLoaded(true)}
                  alt="Message image"
                  borderRadius={4}
                />
                <Skeleton
                  w={"200px"}
                  h={"200px"}
                />
              </Flex>
            )}

            {message.img && imgLoaded && (
              <Flex
                mt={message.text ? 2 : 0}
                w={"200px"}
                position="relative">
                <Image
                  src={message.img}
                  alt="Message image"
                  borderRadius={4}
                />
                <Box
                  alignSelf={"flex-end"}
                  ml={1}
                  color={message.seen ? "blue.400" : ""}
                  fontWeight={"bold"}>
                  <BsCheck2All size={16} />
                </Box>
              </Flex>
            )}
          </Flex>

          <Avatar
            src={user.profilePic}
            w="7"
            h={7}
          />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar
            src={selectedConversation.userProfilePic}
            w="7"
            h={7}
          />

          <Flex
            flexDirection="column"
            maxW="350px">
            {message.text && (
              <Text
                maxW={"350px"}
                bg={"gray.400"}
                p={1}
                borderRadius={"md"}
                color={"black"}>
                {message.text}
              </Text>
            )}

            {message.sharedPost && <SharedPostContent />}

            {message.img && !imgLoaded && (
              <Flex
                mt={message.text ? 2 : 0}
                w={"200px"}>
                <Image
                  src={message.img}
                  hidden
                  onLoad={() => setImgLoaded(true)}
                  alt="Message image"
                  borderRadius={4}
                />
                <Skeleton
                  w={"200px"}
                  h={"200px"}
                />
              </Flex>
            )}

            {message.img && imgLoaded && (
              <Image
                mt={message.text ? 2 : 0}
                w={"200px"}
                src={message.img}
                alt="Message image"
                borderRadius={4}
              />
            )}
          </Flex>
        </Flex>
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent
            bg="gray.dark"
            borderColor="gray.light">
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold">
              Delete Message
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                variant="outline">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Message;
