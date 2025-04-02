import { Avatar, Divider, Flex, Text } from "@chakra-ui/react";

const Comment = ({ reply, lastReply, post }) => {
  // If post is provided, render comments for all replies in the post
  if (post) {
    if (!post.replies || post.replies.length === 0) {
      return (
        <Text
          color="gray.500"
          textAlign="center"
          my={4}>
          No comments yet
        </Text>
      );
    }

    return (
      <>
        {post.replies.map((replyItem, index) => (
          <Flex
            key={replyItem._id || index}
            gap={4}
            py={2}
            my={2}
            w={"full"}>
            <Avatar
              src={replyItem.userProfilePic || "https://bit.ly/broken-link"}
              size={"sm"}
            />
            <Flex
              gap={1}
              w={"full"}
              flexDirection={"column"}>
              <Flex
                w={"full"}
                justifyContent={"space-between"}
                alignItems={"center"}>
                <Text
                  fontSize="sm"
                  fontWeight="bold">
                  {replyItem.username || "Unknown User"}
                </Text>
              </Flex>
              <Text>{replyItem.text || ""}</Text>
            </Flex>
          </Flex>
        ))}
      </>
    );
  }

  // Handle single reply rendering
  if (!reply) return null;

  return (
    <>
      <Flex
        gap={4}
        py={2}
        my={2}
        w={"full"}>
        <Avatar
          src={reply.userProfilePic || "https://bit.ly/broken-link"}
          size={"sm"}
        />
        <Flex
          gap={1}
          w={"full"}
          flexDirection={"column"}>
          <Flex
            w={"full"}
            justifyContent={"space-between"}
            alignItems={"center"}>
            <Text
              fontSize="sm"
              fontWeight="bold">
              {reply.username || "Unknown User"}
            </Text>
          </Flex>
          <Text>{reply.text || ""}</Text>
        </Flex>
      </Flex>
      {!lastReply ? <Divider /> : null}
    </>
  );
};

export default Comment;
