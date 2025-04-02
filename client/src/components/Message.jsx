import {
  Avatar,
  Box,
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
} from "@chakra-ui/react";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsTrash } from "react-icons/bs";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useSocket } from "../context/SocketContext";

const Message = ({ ownMessage, message, onDelete }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const showToast = useShowToast();
  const { socket } = useSocket();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      const res = await fetch(`/api/v1/messages/${message._id}`, {
        method: "DELETE",
      });

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
                  onClick={handleDelete}>
                  Delete
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>

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
          {message.img && !imgLoaded && (
            <Flex
              mt={5}
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
              mt={5}
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
          {message.img && !imgLoaded && (
            <Flex
              mt={5}
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
            <Flex
              mt={5}
              w={"200px"}>
              <Image
                src={message.img}
                alt="Message image"
                borderRadius={4}
              />
            </Flex>
          )}
        </Flex>
      )}
    </>
  );
};

export default Message;
