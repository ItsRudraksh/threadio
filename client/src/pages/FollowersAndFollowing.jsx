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
  const [myFollowers, setFollowers] = useState([]);
  const [myFollowing, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = useParams();
  const reload = useRecoilValue(reloadAtom); // Listen to reload state

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch(
          `/api/v1/users/${username}/followers&following`
        );
        const { userFollowers, userFollowing } = await res.json();
        setFollowers(userFollowers);
        setFollowing(userFollowing);
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

  return (
    <Tabs w={"full"}>
      <TabList w={"full"} mb={2}>
        <Tab w={"50%"}>Followers</Tab>
        <Tab w={"50%"}>Following</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          {myFollowers.map((follower) => (
            <>
              <SuggestedUser user={follower} />
              <Divider my={4} />
            </>
          ))}
        </TabPanel>
        <TabPanel>
          {myFollowing.map((followed) => (
            <>
              <SuggestedUser user={followed} />
              <Divider my={4} />
            </>
          ))}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default FollowersAndFollowing;
