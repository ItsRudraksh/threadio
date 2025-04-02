import React, { useState } from "react";
import {
  Box,
  Button,
  Text,
  Spinner,
  VStack,
  Badge,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { generateImageCaption } from "../services/aiService";

const ImageCaption = ({ imageUrl, onCaptionGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.700");

  const handleGenerateCaption = async () => {
    if (!imageUrl) {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Generating caption for image...");
      const result = await generateImageCaption(imageUrl);

      if (result.caption) {
        setCaption(result.caption);

        if (onCaptionGenerated) {
          onCaptionGenerated(result.caption);
        }

        toast({
          title: "Caption generated",
          description: "Image caption has been generated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("No caption was generated");
      }
    } catch (error) {
      console.error("Caption generation error:", error);
      setError(error.message || "Failed to generate caption");

      toast({
        title: "Error",
        description: error.message || "Failed to generate caption",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      p={4}
      borderRadius="md"
      bg={bgColor}
      width="100%">
      <VStack
        spacing={4}
        align="stretch">
        {error && (
          <Alert
            status="error"
            borderRadius="md">
            <AlertIcon />
            <AlertTitle mr={2}>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setError("")}
            />
          </Alert>
        )}

        <Button
          colorScheme="blue"
          onClick={handleGenerateCaption}
          isLoading={isLoading}
          loadingText="Generating..."
          leftIcon={
            <span
              role="img"
              aria-label="camera">
              📷
            </span>
          }>
          Generate Caption
        </Button>

        {caption && (
          <Box mt={2}>
            <Badge
              colorScheme="green"
              mb={2}>
              AI Generated Caption
            </Badge>
            <Text fontStyle="italic">"{caption}"</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ImageCaption;
