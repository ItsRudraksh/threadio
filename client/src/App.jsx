import { Container } from "@chakra-ui/react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import UserPage from "./pages/UserPage";
import ChatPage from "./pages/ChatPage";
import PostPage from "./pages/PostPage";
import SettingsPage from "./pages/SettingsPage";
const App = () => {
  return (
    <Container maxW="620px">
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" />}
        />
        <Route
          path="/update"
          element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />}
        />

        <Route
          path="/:username"
          element={
            user ? (
              <>
                <UserPage />
                <CreatePost />
              </>
            ) : (
              <UserPage />
            )
          }
        />
        <Route path="/:username/post/:pid" element={<PostPage />} />
        <Route
          path="/chat"
          element={user ? <ChatPage /> : <Navigate to={"/auth"} />}
        />
        <Route
          path="/settings"
          element={user ? <SettingsPage /> : <Navigate to={"/auth"} />}
        />
      </Routes>
    </Container>
  );
};

export default App;
