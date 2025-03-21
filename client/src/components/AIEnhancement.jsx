import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Spinner,
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { enhancePostContent } from "../services/aiService";

const AIEnhancement = ({ onEnhance, initialContent = "" }) => {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState(null);
  const toast = useToast();

  const handleEnhance = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to enhance",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await enhancePostContent(content);
      setEnhancedContent(result);
      onEnhance?.(result.enhancedContent);
      toast({
        title: "Success",
        description: "Content enhanced successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.error || "Failed to enhance content",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyEnhancement = () => {
    if (enhancedContent) {
      setContent(enhancedContent.enhancedContent);
      setEnhancedContent(null);
    }
  };

  return (
    <Box w="100%" p={4} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your post content..."
          size="lg"
          rows={4}
        />
        
        <Button
          colorScheme="blue"
          onClick={handleEnhance}
          isLoading={isLoading}
          loadingText="Enhancing..."
        >
          Enhance with AI
        </Button>

        {enhancedContent && (
          <Box p={4} bg="gray.50" borderRadius="md" bgColor="black" >
            <Text fontWeight="bold" mb={2}>Enhanced Content:</Text>
            <Text mb={4}>{enhancedContent.enhancedContent}</Text>
            
            <Text fontWeight="bold" mb={2}>Suggestions:</Text>
            <VStack align="stretch" spacing={2} mb={4}>
              {enhancedContent.suggestions.map((suggestion, index) => (
                <Text key={index}>• {suggestion}</Text>
              ))}
            </VStack>

            <Text fontWeight="bold" mb={2}>Suggested Hashtags:</Text>
            <Wrap spacing={2} mb={4}>
              {enhancedContent.hashtags.map((hashtag, index) => (
                <WrapItem key={index}>
                  <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                    <TagLabel>{hashtag}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>

            <Button
              colorScheme="green"
              onClick={handleApplyEnhancement}
              size="sm"
            >
              Apply Enhancement
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AIEnhancement; 