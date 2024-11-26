import { Button, Text } from "@chakra-ui/react";
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
      const res = await fetch(`/api/v1/users/freeze`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
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

  return (
    <>
      <Text my={1} fontWeight={"bold"}>
        Freeze Your Account
      </Text>
      <Text my={1}>You can unfreeze your account anytime by logging in.</Text>
      <Button size={"sm"} colorScheme="red" onClick={freezeAccount}>
        Freeze
      </Button>
    </>
  );
};

export default SettingsPage;
