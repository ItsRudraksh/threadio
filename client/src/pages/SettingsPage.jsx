import { Button, Text, VStack, Divider, Box, Heading } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";

const SettingsPage = () => {
  const showToast = useShowToast();
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userAtom);

  const freezeAccount = async () => {
    if (!window.confirm("Are you sure you want to freeze your account?"))
      return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/freeze`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();

      if (data.error) {
        return showToast("Error", data.error, "error");
      }
      localStorage.setItem("user-threads", JSON.stringify(data));
      setUser(data);
      showToast(
        "Success",
        "Your account has been frozen\nRe-Login to unfreeze",
        "success"
      );
      navigate("/auth");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone."
      )
    )
      return;

    if (
      !window.confirm(
        "All your posts and data will be deleted. This is irreversible. Proceed?"
      )
    )
      return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/delete`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.error) {
        return showToast("Error", data.error, "error");
      }

      localStorage.removeItem("user-threads");
      setUser(null);
      showToast(
        "Success",
        "Your account has been permanently deleted",
        "success"
      );
      navigate("/auth");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <VStack
      spacing={6}
      align="start"
      w="full"
      py={4}>
      <Heading size="lg">Account Settings</Heading>

      <Box w="full">
        <Heading
          size="md"
          mb={2}>
          Freeze Account
        </Heading>
        <Text my={1}>
          Temporarily freeze your account. You can unfreeze your account anytime
          by logging in.
        </Text>
        <Button
          size={"sm"}
          colorScheme="blue"
          onClick={freezeAccount}
          mt={2}>
          Freeze Account
        </Button>
      </Box>

      <Divider />

      <Box w="full">
        <Heading
          size="md"
          mb={2}
          color="red.500">
          Delete Account
        </Heading>
        <Text my={1}>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </Text>
        <Button
          size={"sm"}
          colorScheme="red"
          onClick={deleteAccount}
          mt={2}>
          Delete Account
        </Button>
      </Box>
    </VStack>
  );
};

export default SettingsPage;
