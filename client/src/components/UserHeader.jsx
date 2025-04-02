import { Avatar } from "@chakra-ui/react";
import { Box, Flex, Link, Text, VStack, Badge } from "@chakra-ui/react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { Portal } from "@chakra-ui/react";
import { Button, useToast } from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink, useLocation } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const UserHeader = ({
  user,
  activeTab = "threads",
  onTabChange,
  repliesCount = 0,
}) => {
  const toast = useToast();
  const location = useLocation();
  const pathname = location.pathname;
  const currentUser = useRecoilValue(userAtom); // logged in user
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);

  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      toast({
        title: "Success.",
        status: "success",
        description: "Profile link copied.",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  return (
    <VStack
      gap={4}
      alignItems={"start"}>
      <Flex
        justifyContent={"space-between"}
        w={"full"}>
        <Box>
          <Text
            fontSize={"2xl"}
            fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex
            gap={2}
            alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
            <Text
              fontSize={"xs"}
              bg={"gray.dark"}
              color={"gray.light"}
              p={1}
              borderRadius={"full"}>
              threads.net
            </Text>
          </Flex>
        </Box>
        <Box>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text>{user.bio}</Text>

      {currentUser?._id === user._id && (
        <Link
          as={RouterLink}
          to="/update">
          <Button size={"sm"}>Update Profile</Button>
        </Link>
      )}
      {currentUser?._id !== user._id && (
        <Button
          size={"sm"}
          onClick={handleFollowUnfollow}
          isLoading={updating}>
          {following ? "Unfollow" : "Follow"}
        </Button>
      )}
      <Flex
        w={"full"}
        justifyContent={"space-between"}>
        <Flex
          gap={2}
          alignItems={"center"}
          wrap={"wrap"}>
          <Link
            href={
              pathname.includes(currentUser?.username) ? "/connections" : ""
            }
            color={"gray.light"}>
            {user.followers.length} followers
          </Link>
          <Box
            w="1"
            h="1"
            bg={"gray.light"}
            borderRadius={"full"}></Box>
          <Link
            href={
              pathname.includes(currentUser?.username) ? "/connections" : ""
            }
            color={"gray.light"}>
            {user.following.length} following
          </Link>
        </Flex>
        <Flex>
          <Box className="icon-container">
            <BsInstagram
              size={24}
              cursor={"pointer"}
            />
          </Box>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <CgMoreO
                  size={24}
                  cursor={"pointer"}
                />
              </MenuButton>
              <Portal>
                <MenuList bg={"gray.dark"}>
                  <MenuItem
                    bg={"gray.dark"}
                    onClick={copyURL}>
                    Copy link
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={
            activeTab === "threads" ? "1.5px solid white" : "1px solid gray"
          }
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          color={activeTab === "threads" ? "white" : "gray.light"}
          onClick={() => onTabChange("threads")}>
          <Text fontWeight={"bold"}>Threads</Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={
            activeTab === "replies" ? "1.5px solid white" : "1px solid gray"
          }
          justifyContent={"center"}
          color={activeTab === "replies" ? "white" : "gray.light"}
          pb="3"
          cursor={"pointer"}
          onClick={() => onTabChange("replies")}
          position="relative">
          <Flex alignItems="center">
            <Text fontWeight={"bold"}>Replies</Text>
            {repliesCount > 0 && (
              <Badge
                ml={2}
                colorScheme="green"
                borderRadius="full"
                fontSize="0.8em"
                px={2}>
                {repliesCount}
              </Badge>
            )}
          </Flex>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
