import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Box,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { useParams } from "react-router-dom";
import AIEnhancement from "./AIEnhancement";
import ContentModeration from "./ContentModeration";
import { checkContentModeration } from "../services/aiService";
import ImageCaption from "./ImageCaption";

const MAX_CHAR = 500;
const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState("");
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const imageRef = useRef(null);
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { username } = useParams();
  const [isContentAppropriate, setIsContentAppropriate] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [imageCaption, setImageCaption] = useState("");

  const handleTextChange = (e) => {
    const inputText = e.target.value;

    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

  const handleImageCaption = (caption) => {
    setImageCaption(caption);
  };

  const handleCreatePost = async () => {
    if (!postText && !imgUrl) return;
    if (isPosting) return;

    setIsPosting(true);
    try {
      // First check content moderation
      const moderationResult = await checkContentModeration(postText);
      
      if (!moderationResult.isAppropriate) {
        showToast(
          "Content Warning",
          `Your post contains ${moderationResult.reason}. Please revise your content.`,
          "warning"
        );
        setIsPosting(false);
        return;
      }

      const res = await fetch("/api/v1/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postedBy: user._id,
          text: imageCaption ? `${postText}\n\n${imageCaption}` : postText,
          img: imgUrl,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post created successfully", "success");
      onClose();
      setPostText("");
      setImgUrl("");
      setImageCaption("");
      setPosts((posts) => [data, ...posts]);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsPosting(false);
    }
  };

  const handleEnhancement = (enhancedText) => {
    setPostText(enhancedText);
    setRemainingChar(MAX_CHAR - enhancedText.length);
  };

  const handleModerationResult = (result) => {
    setIsContentAppropriate(result.isAppropriate);
  };

  return (
    <>
      <Button
        position={"fixed"}
        bottom={10}
        right={5}
        bg={useColorModeValue("gray.300", "gray.dark")}
        onClick={onOpen}
        size={{ base: "sm", sm: "md" }}
      >
        <AddIcon />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs index={tabIndex} onChange={setTabIndex}>
              <TabList>
                <Tab>Write Post</Tab>
                <Tab>AI Enhance</Tab>
                {/* <Tab>Content Check</Tab> */}
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FormControl>
                    <Textarea
                      placeholder="Post content goes here.."
                      onChange={handleTextChange}
                      value={postText}
                    />
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      textAlign={"right"}
                      m={"1"}
                      color={"gray.800"}
                    >
                      {remainingChar}/{MAX_CHAR}
                    </Text>

                    <Input
                      type="file"
                      hidden
                      ref={imageRef}
                      onChange={handleImageChange}
                    />

                    <BsFillImageFill
                      style={{ marginLeft: "5px", cursor: "pointer" }}
                      size={16}
                      onClick={() => imageRef.current.click()}
                    />
                  </FormControl>

                  {imgUrl && (
                    <Flex mt={5} w={"full"} position={"relative"} flexDirection="column">
                      <Image src={imgUrl} alt="Selected img" />
                      <CloseButton
                        onClick={() => {
                          setImgUrl("");
                          setImageCaption("");
                        }}
                        bg={"gray.800"}
                        position={"absolute"}
                        top={2}
                        right={2}
                      />
                      <Box mt={3}>
                        <ImageCaption 
                          imageUrl={imgUrl}
                          onCaptionGenerated={handleImageCaption} 
                        />
                      </Box>
                    </Flex>
                  )}
                </TabPanel>
                <TabPanel>
                  <AIEnhancement
                    onEnhance={handleEnhancement}
                    initialContent={postText}
                  />
                </TabPanel>
                {/* <TabPanel>
                  <ContentModeration
                    content={postText}
                    onModerationResult={handleModerationResult}
                  />
                </TabPanel> */}
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreatePost}
              isLoading={loading}
              isDisabled={!isContentAppropriate}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
