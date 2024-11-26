import {
  Divider,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SuggestedUser from "../components/SuggestedUser";
import { reloadAtom } from "../atoms/reloadAtom";
import { useRecoilValue } from "recoil";

const FollowersAndFollowing = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const { username } = useParams();
  const reload = useRecoilValue(reloadAtom); // Listen to reload state

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch(
          `/api/v1/users/${username}/followers&following`
        );
        const fetchedData = await res.json();
        setData(fetchedData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchConnections();
  }, [username, reload]);

  if (loading)
    return (
      <Flex justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  if (error) return <p>Error: {error}</p>;

  const { userFollowers = [], userFollowing = [] } = data || {};
  console.log("followers: ", userFollowers);
  console.log("following: ", userFollowing);

  // Remove all null values
  const filteredFollowers = userFollowers.filter(
    (follower) => follower !== null
  );
  const filteredFollowing = userFollowing.filter(
    (following) => following !== null
  );

  return (
    <Tabs w={"full"}>
      <TabList w={"full"} mb={2}>
        <Tab w={"50%"}>Followers</Tab>
        <Tab w={"50%"}>Following</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          {filteredFollowers.map((follower) => (
            <div key={follower.id}>
              <SuggestedUser user={follower} />
              <Divider my={4} />
            </div>
          ))}
        </TabPanel>
        <TabPanel>
          {filteredFollowing.map((followed) => (
            <div key={followed.id}>
              <SuggestedUser user={followed} />
              <Divider my={4} />
            </div>
          ))}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default FollowersAndFollowing;
