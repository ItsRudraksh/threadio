import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import Post from "../components/Post";
import ReplyPost from "../components/ReplyPost";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";

const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState("threads");
  const [replies, setReplies] = useState([]);
  const [fetchingReplies, setFetchingReplies] = useState(false);
  const [repliesCount, setRepliesCount] = useState(0);

  useEffect(() => {
    const getPosts = async () => {
      if (!user) return;
      setFetchingPosts(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/posts/user/${username}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    const getReplies = async () => {
      if (!user) return;
      setFetchingReplies(true);
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/posts/user/${username}/replies`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setReplies(data);
        setRepliesCount(data.length);
      } catch (error) {
        showToast("Error", error.message, "error");
        setReplies([]);
      } finally {
        setFetchingReplies(false);
      }
    };

    if (activeTab === "threads") {
      getPosts();
    } else {
      getReplies();
    }
  }, [username, showToast, setPosts, user, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!user && !loading) return <h1>User not found</h1>;

  return (
    <>
      <UserHeader
        user={user}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        repliesCount={repliesCount}
      />

      {activeTab === "threads" && (
        <>
          {!fetchingPosts && posts.length === 0 && (
            <Text
              textAlign="center"
              my={4}>
              User has no posts.
            </Text>
          )}
          {fetchingPosts && (
            <Flex
              justifyContent={"center"}
              my={12}>
              <Spinner size={"xl"} />
            </Flex>
          )}

          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              postedBy={post.postedBy}
            />
          ))}
        </>
      )}

      {activeTab === "replies" && (
        <>
          {!fetchingReplies && replies.length === 0 && (
            <Text
              textAlign="center"
              my={4}>
              User has no replies.
            </Text>
          )}
          {fetchingReplies && (
            <Flex
              justifyContent={"center"}
              my={12}>
              <Spinner size={"xl"} />
            </Flex>
          )}

          {replies.map((post) => (
            <ReplyPost
              key={post._id}
              post={post}
            />
          ))}
        </>
      )}
    </>
  );
};

export default UserPage;
