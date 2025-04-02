import { useEffect, useState } from "react";
import { Avatar, Box, Flex, Input, List, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const SearchPage = () => {
  const baseURL = window.location.origin;
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const getAllUsers = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/users`, {
        credentials: "include",
      });
      const result = await res.json();
      setUsers(result.allUsers); // Fetch and store the users
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (searchText.trim()) {
      // Filter users only when searchText is not empty
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchText.toLowerCase()) ||
          user.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      // Clear the filtered list if there's no search text
      setFilteredUsers([]);
    }
  }, [searchText, users]);

  return (
    <Flex
      direction="column"
      align="center"
      p={4}>
      <Input
        placeholder="Search users by username or full name"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        mb={4}
        width="100%"
        maxW="400px"
      />

      {/* Show the list of users only when searchText is not empty */}
      {searchText.trim() && (
        <List
          spacing={3}
          width="100%"
          maxW="400px">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Flex
                key={user._id}
                alignItems={"center"}
                p={2}
                border="1px"
                borderRadius="md"
                gap={2}
                as={Link}
                to={`${baseURL}/${user.username}`}>
                <Avatar src={user.profilePic} />
                <Box>
                  <Text
                    fontSize={"sm"}
                    fontWeight={"bold"}>
                    {user.username}
                  </Text>
                  <Text
                    color={"gray.light"}
                    fontSize={"sm"}>
                    {user.name}
                  </Text>
                </Box>
              </Flex>
            ))
          ) : (
            <Text>No users found</Text>
          )}
        </List>
      )}
    </Flex>
  );
};

export default SearchPage;
