import { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Progress,
  Text,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

const passwordRules = [
  { rule: "At least 8 characters", test: (password) => password.length >= 8 },
  {
    rule: "At least 2 uppercase letters",
    test: (password) => /[A-Z].*[A-Z]/.test(password),
  },
  {
    rule: "At least 2 lowercase letters",
    test: (password) => /[a-z].*[a-z]/.test(password),
  },
  { rule: "At least 2 numbers", test: (password) => /\d.*\d/.test(password) },
  {
    rule: "At least 2 special characters",
    test: (password) =>
      /[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

const PasswordFieldWithValidation = ({ value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    return passwordRules.map((rule) => ({
      ...rule,
      isValid: rule.test(password),
    }));
  };

  const rulesValidation = validatePassword(value);
  const progress =
    (rulesValidation.filter((rule) => rule.isValid).length /
      passwordRules.length) *
    100;

  return (
    <FormControl isRequired>
      <FormLabel>Password</FormLabel>
      <InputGroup>
        <Input
          type={showPassword ? "text" : "password"}
          onChange={(e) => onChange(e.target.value)}
          value={value}
        />
        <InputRightElement h={"full"}>
          <Button
            variant={"ghost"}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
          </Button>
        </InputRightElement>
      </InputGroup>
      {/* Progress Bar */}
      <Progress value={progress} size="xs" colorScheme="green" mt={2} />
      {/* Password Rules */}
      <Box mt={2}>
        <List spacing={1}>
          {rulesValidation.map((rule, index) => (
            <ListItem
              key={index}
              color={rule.isValid ? "green.500" : "red.500"}
            >
              <ListIcon
                as={rule.isValid ? CheckIcon : CloseIcon}
                color={rule.isValid ? "green.500" : "red.500"}
              />
              <Text as={rule.isValid ? "s" : "span"}>{rule.rule}</Text>
            </ListItem>
          ))}
        </List>
      </Box>
    </FormControl>
  );
};

export default PasswordFieldWithValidation;
