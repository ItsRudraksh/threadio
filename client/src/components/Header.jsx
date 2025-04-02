import {
  Button,
  Flex,
  Image,
  Link,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FaMagnifyingGlass as SearchIcon } from "react-icons/fa6";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authScreenAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import NotificationIcon from "./NotificationIcon";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  return (
    <Flex
      justifyContent={"space-between"}
      mt={6}
      mb="12">
      {user && (
        <Flex
          alignItems={"center"}
          gap={4}>
          <Tooltip label="Home">
            <Link
              as={RouterLink}
              to="/">
              <AiFillHome size={24} />
            </Link>
          </Tooltip>
          <Tooltip label="Search">
            <Link
              as={RouterLink}
              to="/search">
              <SearchIcon size={20} />
            </Link>
          </Tooltip>
        </Flex>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("login")}>
          Login
        </Link>
      )}

      <Tooltip label="Switch Modes">
        <Image
          cursor={"pointer"}
          alt="logo"
          w={6}
          src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
          onClick={toggleColorMode}
        />
      </Tooltip>

      {user && (
        <Flex
          alignItems={"center"}
          gap={4}>
          <NotificationIcon />
          <Tooltip label="Profile">
            <Link
              as={RouterLink}
              to={`/${user.username}`}>
              <RxAvatar size={24} />
            </Link>
          </Tooltip>
          <Tooltip label="Chat">
            <Link
              as={RouterLink}
              to={`/chat`}>
              <BsFillChatQuoteFill size={20} />
            </Link>
          </Tooltip>
          <Tooltip label="Settings">
            <Link
              as={RouterLink}
              to={`/settings`}>
              <MdOutlineSettings size={20} />
            </Link>
          </Tooltip>
          <Tooltip label="Logout">
            <Button
              size={"xs"}
              onClick={logout}>
              <FiLogOut size={20} />
            </Button>
          </Tooltip>
        </Flex>
      )}

      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("signup")}>
          Sign up
        </Link>
      )}
    </Flex>
  );
};

export default Header;
