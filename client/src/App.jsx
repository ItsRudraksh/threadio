import { Box, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import UserPage from "./pages/UserPage";
import ChatPage from "./pages/ChatPage";
import PostPage from "./pages/PostPage";
import SettingsPage from "./pages/SettingsPage";
import Header from "./components/Header";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import CreatePost from "./components/CreatePost";
import FollowersAndFollowing from "./pages/FollowersAndFollowing";
import SearchPage from "./pages/SearchPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LandingPage from "./pages/LandingPage";

const App = () => {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();
  const isLandingPage = pathname === "/";

  return (
    <Box
      position={"relative"}
      w="full">
      <Container
        maxW={
          isLandingPage
            ? "full"
            : pathname === "/feed"
            ? { base: "620px", md: "900px" }
            : "620px"
        }
        p={isLandingPage ? 0 : undefined}>
        {!isLandingPage && <Header />}
        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />
          <Route
            path="/feed"
            element={
              user && !user.frozen ? <HomePage /> : <Navigate to="/auth" />
            }
          />
          <Route
            path="/auth"
            element={
              !user || user.frozen ? <AuthPage /> : <Navigate to="/feed" />
            }
          />
          <Route
            path="/update"
            element={
              user && !user.frozen ? (
                <UpdateProfilePage />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />

          <Route
            path="/:username"
            element={
              user && !user.frozen ? (
                <>
                  <UserPage />
                  <CreatePost />
                </>
              ) : (
                <UserPage />
              )
            }
          />
          <Route
            path="/:username/post/:pid"
            element={<PostPage />}
          />
          <Route
            path="/chat"
            element={
              user && !user.frozen ? <ChatPage /> : <Navigate to={"/auth"} />
            }
          />
          <Route
            path="/settings"
            element={
              user && !user.frozen ? (
                <SettingsPage />
              ) : (
                <Navigate to={"/auth"} />
              )
            }
          />
          <Route
            path="/connections"
            element={
              user && !user.frozen ? (
                <FollowersAndFollowing />
              ) : (
                <Navigate to={"/auth"} />
              )
            }
          />
          <Route
            path="/search"
            element={
              user && !user.frozen ? <SearchPage /> : <Navigate to={"/auth"} />
            }
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
