import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Email Sent",
          description: data.message || "Check your inbox for the reset link.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Something went wrong.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send the reset email.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="sm"
      mx="auto"
      mt={10}
      p={8}
      rounded="lg"
      boxShadow="lg"
      bg={useColorModeValue("white", "gray.800")}
    >
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <Button
          isLoading={loading}
          loadingText="Sending..."
          colorScheme="blue"
          onClick={handleForgotPassword}
        >
          Send Reset Link
        </Button>
      </Stack>
    </Box>
  );
};

export default ForgotPassword;
