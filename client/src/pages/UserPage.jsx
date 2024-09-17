import UserHeader from "../components/UserHeader";
import UserPost from "../components/UserPost";
const UserPage = () => {
  return (
    <>
      <UserHeader />
      <UserPost
        likes={100}
        replies={23}
        postImg={"/post1.png"}
        postTitle={"Let's go threadss !!"}
      />
      <UserPost
        likes={20}
        replies={2}
        postImg={"/post2.png"}
        postTitle={"I'm on threads !!"}
      />
      <UserPost
        likes={12314}
        replies={123}
        postImg={"/post3.png"}
        postTitle={"X vs Threads !!"}
      />
      <UserPost
        likes={12314}
        replies={123}
        postTitle={"Its my 1st thread !!"}
      />
    </>
  );
};

export default UserPage;
