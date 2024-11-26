import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authScreenAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import PasswordFieldWithValidation from "./PasswordFieldWithValidation";
import { useNavigate } from "react-router-dom";
const SignupCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false); // State to toggle OTP screen
  const showToast = useShowToast();
  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await fetch(`/api/v1/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Show success message and toggle to OTP input
      showToast("Success", "Signup successful. Verify to continue.", "success");
      setShowOtpInput(true);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch(`/api/v1/users/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: inputs.email, otp }),
      });
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Save user data and redirect to app
      localStorage.setItem("user-threads", JSON.stringify(data));
      setUser(data);
      showToast(
        "Success",
        "Verification successful! Now login to continue",
        "success"
      );
      // setAuthScreen("login");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <Flex align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            {showOtpInput ? "Verify Your Email" : "Sign up"}
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.dark")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            {showOtpInput ? (
              // OTP Input Screen
              <FormControl isRequired>
                <FormLabel>Enter OTP</FormLabel>
                <Input
                  type="text"
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp.trim()}
                />
                <Stack spacing={10} pt={4}>
                  <Button
                    size="lg"
                    bg={useColorModeValue("gray.600", "gray.700")}
                    color={"white"}
                    _hover={{
                      bg: useColorModeValue("gray.700", "gray.800"),
                    }}
                    onClick={handleVerifyOtp}
                  >
                    Verify
                  </Button>
                </Stack>
              </FormControl>
            ) : (
              // Signup Form
              <>
                <HStack>
                  <Box>
                    <FormControl isRequired>
                      <FormLabel>Full name</FormLabel>
                      <Input
                        type="text"
                        onChange={(e) =>
                          setInputs({ ...inputs, name: e.target.value })
                        }
                        value={inputs.name}
                      />
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl isRequired>
                      <FormLabel>Username</FormLabel>
                      <Input
                        type="text"
                        onChange={(e) =>
                          setInputs({ ...inputs, username: e.target.value })
                        }
                        value={inputs.username}
                      />
                    </FormControl>
                  </Box>
                </HStack>
                <FormControl isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Input
                    type="email"
                    onChange={(e) =>
                      setInputs({ ...inputs, email: e.target.value })
                    }
                    value={inputs.email}
                  />
                </FormControl>

                <PasswordFieldWithValidation
                  value={inputs.password}
                  onChange={(password) => setInputs({ ...inputs, password })}
                />
                <Stack spacing={10} pt={2}>
                  <Button
                    loadingText="Submitting"
                    size="lg"
                    bg={useColorModeValue("gray.600", "gray.700")}
                    color={"white"}
                    _hover={{
                      bg: useColorModeValue("gray.700", "gray.800"),
                    }}
                    onClick={handleSignup}
                  >
                    Sign up
                  </Button>
                </Stack>
              </>
            )}
            {!showOtpInput && (
              <Stack pt={6}>
                <Text align={"center"}>
                  Already a user?{" "}
                  <Link
                    color={"blue.400"}
                    onClick={() => setAuthScreen("login")}
                  >
                    Login
                  </Link>
                </Text>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default SignupCard;
