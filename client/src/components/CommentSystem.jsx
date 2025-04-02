import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { FaReply } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

const REPLIES_PER_PAGE = 5;

const CommentSystem = ({ post }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleReplies, setVisibleReplies] = useState(REPLIES_PER_PAGE);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const showToast = useShowToast();
  const user = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);

  useEffect(() => {
    if (post?.replies) {
      console.log("Setting initial replies from post:", post.replies.length);

      // Recursive function to ensure all nested childReplies are properly initialized
      const processRepliesRecursively = (replies, depth = 0) => {
        if (!replies || !Array.isArray(replies)) return [];

        return replies.map((reply) => {
          // Create a proper copy with all needed properties
          const processedReply = {
            ...reply,
            username: reply.username || "Anonymous",
            childReplies: Array.isArray(reply.childReplies)
              ? reply.childReplies
              : [],
          };

          // Process any nested childReplies recursively
          if (
            processedReply.childReplies &&
            processedReply.childReplies.length > 0
          ) {
            processedReply.childReplies = processRepliesRecursively(
              processedReply.childReplies,
              depth + 1
            );
          }

          return processedReply;
        });
      };

      // Initialize all levels of replies
      setReplies(processRepliesRecursively(post.replies));
    }
  }, [post]);

  const loadMoreReplies = () => {
    setVisibleReplies((prev) => prev + REPLIES_PER_PAGE);
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    if (!user) {
      showToast("Error", "You must be logged in to comment", "error");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/v1/posts/comment/${post._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newCommentText }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Add the comment to the local state
      const newComment = {
        ...data,
        userProfilePic: user.profilePic,
        username: user.username,
        userId: user._id,
        childReplies: [],
      };

      setReplies((prev) => [newComment, ...prev]);

      // Update the post in the posts atom
      setPosts((prev) =>
        prev.map((p) => {
          if (p && p._id && post._id && p._id === post._id) {
            return {
              ...p,
              replies: [newComment, ...p.replies],
            };
          }
          return p;
        })
      );

      setNewCommentText("");
      showToast("Success", "Comment posted", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!post) return null;

  return (
    <Box w="full">
      {/* New comment form */}
      <Flex
        gap={3}
        mb={4}
        alignItems="flex-start">
        <Avatar
          src={user?.profilePic || "https://bit.ly/broken-link"}
          size="sm"
        />
        <FormControl>
          <Flex
            gap={2}
            direction={{ base: "column", md: "row" }}>
            <Input
              placeholder="Add a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <Button
              colorScheme="blue"
              isLoading={submittingComment}
              onClick={handleAddComment}
              alignSelf={{ base: "flex-end", md: "auto" }}>
              Comment
            </Button>
          </Flex>
        </FormControl>
      </Flex>

      <Divider my={4} />

      {/* Loading state */}
      {loading && (
        <Flex
          justify="center"
          my={4}>
          <Spinner size="md" />
        </Flex>
      )}

      {/* No comments state */}
      {!loading && (!replies || replies.length === 0) && (
        <Text
          color="gray.500"
          textAlign="center"
          my={4}>
          No comments yet. Be the first to comment!
        </Text>
      )}

      {/* Comment list */}
      {replies.slice(0, visibleReplies).map((reply, index) => (
        <CommentWithReplies
          key={reply._id || index}
          reply={reply}
          postId={post._id}
          setReplies={setReplies}
          setPosts={setPosts}
          depth={0}
          isLastVisible={index === visibleReplies - 1}
        />
      ))}

      {/* Load more button */}
      {replies.length > visibleReplies && (
        <Button
          onClick={loadMoreReplies}
          variant="ghost"
          size="sm"
          mx="auto"
          my={4}
          display="block">
          Show more comments
        </Button>
      )}
    </Box>
  );
};

const CommentWithReplies = ({
  reply,
  postId,
  setReplies,
  setPosts,
  depth = 0,
  isLastVisible,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showChildReplies, setShowChildReplies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const maxDepth = 5; // Increased from 3

  // Auto-expand child replies when new replies are added
  useEffect(() => {
    if (reply?.childReplies?.length > 0 && depth < 2) {
      setShowChildReplies(true);
    }
  }, [reply?.childReplies?.length, depth]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (!user) {
      showToast("Error", "You must be logged in to reply", "error");
      return;
    }

    setSubmitting(true);
    try {
      // Include parentId to indicate this is a reply to another comment
      const res = await fetch(`/api/v1/posts/comment/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: replyText,
          parentId: reply._id
            ? reply._id.toString()
            : reply.userId
            ? reply.userId.toString()
            : null, // Make sure we pass a string ID
        }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      console.log("Reply posted successfully:", data);

      // Create the new reply object with correct data
      const newReply = {
        ...data,
        userProfilePic: user.profilePic,
        username: user.username,
        userId: user._id,
        childReplies: [],
      };

      console.log("Original data from server:", data);
      console.log("New reply to add:", newReply);
      console.log(
        "Parent reply (_id):",
        reply._id ? reply._id.toString() : "null"
      );
      console.log("Reply depth:", depth);

      // For debugging purposes, serialize the full replies tree now
      console.log(
        "BEFORE - Current replies structure:",
        JSON.stringify(
          replies.map((r) => ({
            id: r._id,
            text: r.text.substring(0, 15) + "...",
            childCount: r.childReplies?.length || 0,
          })),
          null,
          2
        )
      );

      // Add the new reply to the parent comment's childReplies using recursive function
      setReplies((prev) => {
        // Recursive function to find the correct parent and add the reply
        const updateRepliesRecursively = (replies) => {
          if (!replies || !Array.isArray(replies)) {
            console.log("Invalid replies array encountered:", replies);
            return replies;
          }

          return replies.map((r) => {
            // Convert IDs to strings for reliable comparison
            const rIdStr = r._id ? r._id.toString() : null;
            const replyIdStr = reply._id ? reply._id.toString() : null;

            // If this is the target parent reply
            if (rIdStr && replyIdStr && rIdStr === replyIdStr) {
              console.log(
                "Found parent reply at depth",
                depth,
                "- text:",
                r.text.substring(0, 20),
                "- adding child:",
                newReply.text.substring(0, 20)
              );

              // Create a new childReplies array if it doesn't exist
              const updatedChildReplies = Array.isArray(r.childReplies)
                ? [...r.childReplies, newReply]
                : [newReply];

              return {
                ...r,
                childReplies: updatedChildReplies,
              };
            }

            // If not found at this level, search in child replies
            if (
              r.childReplies &&
              Array.isArray(r.childReplies) &&
              r.childReplies.length > 0
            ) {
              console.log(
                "Searching in childReplies of:",
                r.text.substring(0, 15),
                "- children count:",
                r.childReplies.length
              );

              const updatedChildReplies = updateRepliesRecursively(
                r.childReplies
              );

              // Make sure we're not losing array structure
              if (!Array.isArray(updatedChildReplies)) {
                console.error(
                  "Non-array result from recursion:",
                  updatedChildReplies
                );
                return r;
              }

              // If children were modified, return the updated reply
              if (
                JSON.stringify(updatedChildReplies) !==
                JSON.stringify(r.childReplies)
              ) {
                console.log(
                  "Found match in nested replies, updating:",
                  r.text.substring(0, 15),
                  "- new children count:",
                  updatedChildReplies.length
                );
                return {
                  ...r,
                  childReplies: updatedChildReplies,
                };
              }
            }

            // No changes to this reply
            return r;
          });
        };

        // Start the recursive search from the top level
        const result = updateRepliesRecursively(prev);

        // Check if the new reply was actually added somewhere
        const wasReplyAdded = JSON.stringify(result).includes(newReply.text);

        if (!wasReplyAdded) {
          console.warn(
            "Failed to find the right parent comment in the UI state. Adding as top-level reply"
          );

          // Fallback: add as a top-level reply if we couldn't match it properly
          return [
            ...result,
            {
              ...newReply,
              text: `${newReply.text} (Originally a reply to ${
                reply.username || "someone"
              })`,
              addedAsFallback: true,
            },
          ];
        }

        // Log the result for debugging
        console.log(
          "AFTER - Updated replies structure:",
          JSON.stringify(
            result.map((r) => ({
              id: r._id,
              text: r.text.substring(0, 15) + "...",
              childCount: r.childReplies?.length || 0,
            })),
            null,
            2
          )
        );

        return result;
      });

      setReplyText("");
      setIsReplying(false);
      showToast("Success", "Reply posted", "success");
      setShowChildReplies(true); // Show replies after posting
    } catch (error) {
      console.error("Error posting reply:", error);
      showToast("Error", error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!user) {
      showToast("Error", "You must be logged in to delete a comment", "error");
      return;
    }

    // Check if the user is the owner of the comment
    if (user._id !== reply.userId) {
      showToast("Error", "You can only delete your own comments", "error");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/posts/comment/${postId}/${reply._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Remove the comment from local state
      if (depth === 0) {
        // If it's a top-level comment, remove it from replies completely
        setReplies((prev) => prev.filter((r) => r._id !== reply._id));

        // Update the post in the posts atom
        setPosts((prev) =>
          prev.map((p) => {
            if (p && p._id && postId && p._id === postId) {
              return {
                ...p,
                replies: p.replies.filter((r) => r._id !== reply._id),
              };
            }
            return p;
          })
        );
      } else {
        // If it's a nested reply, mark as deleted but keep in tree structure
        setReplies((prev) =>
          prev.map((r) => {
            // Use a recursive function to find and update the deleted reply
            const updateChildReplies = (replies) => {
              if (!replies || !Array.isArray(replies)) return [];

              return replies.map((childReply) => {
                if (!childReply) return childReply;

                if (
                  childReply._id &&
                  reply._id &&
                  childReply._id.toString() === reply._id.toString()
                ) {
                  return {
                    ...childReply,
                    text: "This comment was deleted",
                    isDeleted: true,
                  };
                }
                if (
                  childReply.childReplies &&
                  Array.isArray(childReply.childReplies) &&
                  childReply.childReplies.length > 0
                ) {
                  return {
                    ...childReply,
                    childReplies: updateChildReplies(childReply.childReplies),
                  };
                }
                return childReply;
              });
            };

            return {
              ...r,
              childReplies: updateChildReplies(r.childReplies || []),
            };
          })
        );
      }

      showToast("Success", "Comment deleted", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const isCommentOwner = user && user._id === reply.userId;
  const isDeleted = reply.isDeleted;

  return (
    <Box
      ml={depth > 0 ? `${depth * 8}px` : 0}
      mb={2}>
      <Flex
        gap={3}
        py={2}
        alignItems="flex-start">
        <Avatar
          src={reply.userProfilePic || "https://bit.ly/broken-link"}
          size="sm"
        />
        <Box w="full">
          <Flex
            direction="column"
            p={2}
            borderRadius="md"
            bg={depth % 2 === 0 ? "gray.900" : "gray.800"}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              mb={1}>
              <Text
                fontSize="sm"
                fontWeight="bold">
                {reply.username || "Anonymous"}
              </Text>
              <Flex
                alignItems="center"
                gap={2}>
                <Text
                  fontSize="xs"
                  color="gray.500">
                  {reply.createdAt
                    ? formatDistanceToNow(new Date(reply.createdAt), {
                        addSuffix: true,
                      })
                    : ""}
                </Text>

                {isCommentOwner && !isDeleted && (
                  <Menu
                    placement="bottom-end"
                    size="sm">
                    <MenuButton
                      as={IconButton}
                      icon={<BsThreeDotsVertical />}
                      variant="ghost"
                      size="xs"
                      aria-label="Comment options"
                    />
                    <MenuList>
                      <MenuItem
                        onClick={onOpen}
                        color="red.400">
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                )}
              </Flex>
            </Flex>
            <Text
              fontSize="sm"
              mb={1}
              fontStyle={isDeleted ? "italic" : "normal"}
              color={isDeleted ? "gray.500" : "inherit"}>
              {isDeleted ? "This comment was deleted" : reply.text || ""}
            </Text>

            {!isDeleted && depth < maxDepth && (
              <Flex justifyContent="flex-start">
                <IconButton
                  icon={<FaReply />}
                  size="xs"
                  variant="ghost"
                  aria-label="Reply"
                  onClick={() => setIsReplying(!isReplying)}
                />
              </Flex>
            )}
          </Flex>

          {isReplying && (
            <Flex
              mt={2}
              alignItems="flex-start"
              gap={2}>
              <Avatar
                src={user?.profilePic || "https://bit.ly/broken-link"}
                size="xs"
              />
              <FormControl>
                <Flex gap={2}>
                  <Input
                    placeholder="Write a reply..."
                    size="sm"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    colorScheme="blue"
                    isLoading={submitting}
                    onClick={handleReply}>
                    Reply
                  </Button>
                </Flex>
              </FormControl>
            </Flex>
          )}

          {/* Child replies section */}
          {reply &&
            reply.childReplies &&
            Array.isArray(reply.childReplies) &&
            reply.childReplies.length > 0 && (
              <Box mt={2}>
                {!showChildReplies ? (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setShowChildReplies(true)}
                    ml={2}>
                    Show {reply.childReplies.length}{" "}
                    {reply.childReplies.length === 1 ? "reply" : "replies"}
                  </Button>
                ) : (
                  <>
                    {reply.childReplies.map((childReply, index) => {
                      // Skip any invalid child replies
                      if (!childReply) return null;

                      return (
                        <CommentWithReplies
                          key={childReply?._id || index}
                          reply={childReply}
                          postId={postId}
                          setReplies={setReplies}
                          setPosts={setPosts}
                          depth={depth + 1}
                          isLastVisible={
                            index === reply.childReplies.length - 1
                          }
                        />
                      );
                    })}
                    {reply.childReplies.length > 0 && (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setShowChildReplies(false)}
                        ml={2}
                        mt={1}>
                        Hide replies
                      </Button>
                    )}
                  </>
                )}
              </Box>
            )}
        </Box>
      </Flex>
      {isLastVisible && <Divider my={2} />}

      {/* Delete Comment Alert Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold">
              Delete Comment
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteComment}
                ml={3}
                isLoading={isDeleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default CommentSystem;
