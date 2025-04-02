import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  Box,
  Button,
  Text,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import useShowToast from "../hooks/useShowToast";
import {
  conversationAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { BsFillImageFill } from "react-icons/bs";
import { MdSmartToy } from "react-icons/md";
import usePreviewImg from "../hooks/usePreviewImg";

const MessageInput = ({ setMessages, messages }) => {
  const [messageText, setMessageText] = useState("");
  const [isAiCommandActive, setIsAiCommandActive] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
  const showToast = useShowToast();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationAtom);
  const imageRef = useRef(null);
  const { onClose } = useDisclosure();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);

  // Check if the message is an AI command
  useEffect(() => {
    if (messageText === "/ai") {
      if (!selectedConversation?._id) {
        showToast("Error", "No conversation selected", "error");
        return;
      }
      setIsAiCommandActive(true);
      fetchAiSuggestions();
    } else if (messageText.startsWith("/ai") && messageText.length > 3) {
      // Do nothing - user is still typing after /ai
    } else if (isAiCommandActive) {
      setIsAiCommandActive(false);
      setAiSuggestions([]);
    }
  }, [messageText, selectedConversation]);

  const fetchAiSuggestions = async () => {
    if (loadingAiSuggestions) return;
    setLoadingAiSuggestions(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/ai/chat-suggestions/${
          selectedConversation._id
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        setIsAiCommandActive(false);
        return;
      }

      setAiSuggestions(data.suggestions || []);
    } catch (error) {
      showToast("Error", "Failed to get AI suggestions", "error");
      setIsAiCommandActive(false);
    } finally {
      setLoadingAiSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setMessageText(suggestion);
    setIsAiCommandActive(false);
    setAiSuggestions([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl) return;
    if (isSending) return;

    // If it's just the AI command, don't send it
    if (messageText === "/ai") return;

    setIsSending(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageText,
            recipientId: selectedConversation.userId,
            img: imgUrl,
          }),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      console.log(data);
      setMessages((messages) => [...messages, data]);

      setConversations((prevConvs) => {
        const updatedConversations = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
      setMessageText("");
      setImgUrl("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleAiButtonClick = () => {
    if (messageText === "/ai") {
      // If already showing AI suggestions, hide them
      setIsAiCommandActive(false);
      setAiSuggestions([]);
      setMessageText("");
    } else {
      // Otherwise, activate AI suggestions
      setMessageText("/ai");
    }
  };

  return (
    <Box w="100%">
      {isAiCommandActive && (
        <VStack
          mb={4}
          p={3}
          bg="gray.700"
          borderRadius="md"
          spacing={3}
          align="stretch">
          <Flex
            justify="space-between"
            align="center">
            <Text
              fontWeight="bold"
              fontSize="sm"
              color="gray.200">
              AI Suggestions
            </Text>
            <IconButton
              icon={<MdSmartToy />}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              aria-label="AI Suggestions"
              onClick={() => {
                setIsAiCommandActive(false);
                setAiSuggestions([]);
                setMessageText("");
              }}
            />
          </Flex>

          {loadingAiSuggestions ? (
            <Flex
              justify="center"
              py={2}>
              <Spinner
                size="sm"
                color="blue.400"
              />
              <Text
                ml={2}
                fontSize="sm"
                color="gray.400">
                Generating suggestions...
              </Text>
            </Flex>
          ) : (
            <VStack
              spacing={2}
              align="stretch">
              {aiSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  justifyContent="flex-start"
                  textAlign="left"
                  whiteSpace="normal"
                  height="auto"
                  py={2}
                  px={3}
                  borderColor="gray.600"
                  _hover={{ bg: "gray.600" }}
                  onClick={() => handleSelectSuggestion(suggestion)}>
                  <Text
                    fontSize="sm"
                    color="gray.200"
                    noOfLines={2}>
                    {suggestion}
                  </Text>
                </Button>
              ))}
              {aiSuggestions.length === 0 && !loadingAiSuggestions && (
                <Text
                  fontSize="sm"
                  color="gray.400"
                  textAlign="center">
                  No suggestions available. Try again later.
                </Text>
              )}
            </VStack>
          )}
        </VStack>
      )}

      <Flex
        gap={2}
        alignItems={"center"}>
        <form
          onSubmit={handleSendMessage}
          style={{ flex: 90 }}>
          <InputGroup>
            <Input
              w={"full"}
              placeholder="Type a message or /ai for suggestions"
              onChange={(e) => setMessageText(e.target.value)}
              value={messageText}
            />
            <InputRightElement
              onClick={handleSendMessage}
              cursor={"pointer"}>
              <IoSendSharp />
            </InputRightElement>
          </InputGroup>
        </form>
        <Flex
          flex={5}
          gap={2}>
          <IconButton
            aria-label="AI suggestions"
            icon={<MdSmartToy />}
            size="sm"
            colorScheme={isAiCommandActive ? "blue" : "gray"}
            onClick={handleAiButtonClick}
          />
          <IconButton
            aria-label="Upload image"
            icon={<BsFillImageFill />}
            size="sm"
            onClick={() => imageRef.current.click()}
          />
          <Input
            type={"file"}
            hidden
            ref={imageRef}
            onChange={handleImageChange}
          />
        </Flex>
      </Flex>

      <Modal
        isOpen={imgUrl}
        onClose={() => {
          onClose();
          setImgUrl("");
        }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              mt={5}
              w={"full"}>
              <Image src={imgUrl} />
            </Flex>
            <Flex
              justifyContent={"flex-end"}
              my={2}>
              {!isSending ? (
                <IoSendSharp
                  size={24}
                  cursor={"pointer"}
                  onClick={handleSendMessage}
                />
              ) : (
                <Spinner size={"md"} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MessageInput;
