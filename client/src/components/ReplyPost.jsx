import { Avatar, Image, Box, Flex, Text, Divider } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const ReplyPost = ({ post }) => {
  const [originalUser, setOriginalUser] = useState(null);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const currentUser = useRecoilValue(userAtom);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/users/profile/${post.postedBy}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setOriginalUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setOriginalUser(null);
      }
    };

    getUser();
  }, [post.postedBy, showToast]);

  if (!originalUser) return null;

  return (
    <Link to={`/${originalUser.username}/post/${post._id}`}>
      <Flex
        gap={3}
        mb={4}
        py={5}
        direction="column">
        {/* Original Post Section */}
        <Flex gap={3}>
          <Flex
            flexDirection="column"
            alignItems="center">
            <Avatar
              size="md"
              name={originalUser.name}
              src={originalUser?.profilePic}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/${originalUser.username}`);
              }}
            />
            <Box
              w="1px"
              h="full"
              bg="gray.light"
              my={2}></Box>
          </Flex>

          <Flex
            flex={1}
            flexDirection="column"
            gap={1}>
            <Flex
              justifyContent="space-between"
              w="full">
              <Flex
                w="full"
                alignItems="center">
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${originalUser.username}`);
                  }}>
                  {originalUser?.username}
                </Text>
                <Image
                  src="/verified.png"
                  w={4}
                  h={4}
                  ml={1}
                />
              </Flex>
              <Text
                fontSize="xs"
                width={36}
                textAlign="right"
                color="gray.light">
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </Text>
            </Flex>

            <Text fontSize="sm">{post.text}</Text>
            {post.img && (
              <Box
                borderRadius={6}
                overflow="hidden"
                border="1px solid"
                borderColor="gray.light">
                <Image
                  src={post.img}
                  w="full"
                />
              </Box>
            )}
          </Flex>
        </Flex>

        <Divider />

        {/* User's Reply Section */}
        {post.replies.map((reply) => (
          <Flex
            key={reply._id || reply.userId}
            gap={3}
            ml={12}>
            <Avatar
              size="sm"
              name={currentUser.name}
              src={reply.userProfilePic || currentUser.profilePic}
            />

            <Flex
              flex={1}
              flexDirection="column"
              gap={1}>
              <Flex alignItems="center">
                <Text
                  fontSize="sm"
                  fontWeight="bold">
                  {reply.username || currentUser.username}
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.light"
                  ml={2}>
                  (Your reply)
                </Text>
              </Flex>

              <Text fontSize="sm">{reply.text}</Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Link>
  );
};

export default ReplyPost;
