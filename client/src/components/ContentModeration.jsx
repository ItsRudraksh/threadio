import React, { useState } from "react";
import {
  Box,
  Button,
  Text,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { checkContentModeration } from "../services/aiService";

const ContentModeration = ({ content, onModerationResult }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [moderationResult, setModerationResult] = useState(null);
  const toast = useToast();

  const handleModeration = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to moderate",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await checkContentModeration(content);
      setModerationResult(result);
      onModerationResult?.(result);
      
      if (!result.isAppropriate) {
        toast({
          title: "Content Warning",
          description: result.reason,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Content Approved",
          description: "Your content meets our community guidelines",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.error || "Failed to moderate content",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="100%" p={4} borderWidth="1px" borderRadius="lg">
      <Button
        colorScheme="blue"
        onClick={handleModeration}
        isLoading={isLoading}
        loadingText="Checking Content..."
        mb={4}
      >
        Check Content Guidelines
      </Button>

      {moderationResult && (
        <Alert
          status={moderationResult.isAppropriate ? "success" : "warning"}
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="auto"
          p={4}
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            {moderationResult.isAppropriate ? "Content Approved" : "Content Warning"}
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {moderationResult.isAppropriate
              ? "Your content meets our community guidelines"
              : moderationResult.reason}
          </AlertDescription>
        </Alert>
      )}
    </Box>
  );
};

export default ContentModeration; 