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
} from "@chakra-ui/react";
import { generateImageCaption } from "../services/aiService";

const ImageCaption = ({ imageUrl, onCaptionGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [caption, setCaption] = useState("");
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
    try {
      const result = await generateImageCaption(imageUrl);
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
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate caption",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4} borderRadius="md" bg={bgColor} width="100%">
      <VStack spacing={4} align="stretch">
        <Button
          colorScheme="blue"
          onClick={handleGenerateCaption}
          isLoading={isLoading}
          loadingText="Generating..."
          leftIcon={<span role="img" aria-label="camera">📷</span>}
        >
          Generate Caption
        </Button>

        {caption && (
          <Box mt={2}>
            <Badge colorScheme="green" mb={2}>
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