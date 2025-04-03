import { useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  Image,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { FiMessageCircle, FiUsers, FiLock, FiSettings } from "react-icons/fi";
import { BsLightningCharge, BsAndroid } from "react-icons/bs";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import {
  FaRegComment,
  FaRegHeart,
  FaShare,
  FaHashtag,
  FaRegUserCircle,
  FaRegBell,
  FaRegImage,
  FaUserFriends,
} from "react-icons/fa";

// Create motion components with Chakra components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionImage = motion(Image);
const MotionIcon = motion(Icon);

const LandingPage = () => {
  const user = useRecoilValue(userAtom);
  const [isHovered, setIsHovered] = useState(false);
  const heroRef = useRef(null);

  // For parallax scrolling effect
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);

  // Background colors
  const bgGradient = useColorModeValue(
    "linear(to-b, blue.50, white)",
    "linear(to-b, gray.900, #101010)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const ctaBg = useColorModeValue("blue.500", "blue.400");
  const iconColor = useColorModeValue("blue.500", "blue.300");

  // Floating animation variants
  const floatingIconVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };

  const floatingIconReverseVariants = {
    animate: {
      y: [0, 10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };

  const rotateIconVariants = {
    animate: {
      rotate: [0, 10, 0, -10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Features data
  const features = [
    {
      icon: FiMessageCircle,
      title: "Real-time Chat",
      description:
        "Message your connections instantly with seen status and image support.",
    },
    {
      icon: FiUsers,
      title: "Social Network",
      description:
        "Create posts, follow users, like and comment on content you love.",
    },
    {
      icon: BsLightningCharge,
      title: "Lightning Fast",
      description: "Optimized performance for a seamless user experience.",
    },
    {
      icon: BsAndroid,
      title: "AI-Powered",
      description:
        "Smart chat suggestions, content moderation and post enhancement.",
    },
    {
      icon: FiLock,
      title: "Secure",
      description: "Account protection with 2FA and robust data security.",
    },
    {
      icon: FiSettings,
      title: "Customizable",
      description:
        "Switch between dark and light mode and personalize your experience.",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
    hover: {
      y: -5,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <Box ref={heroRef}>
      {/* Hero Section */}
      <Box
        bgGradient={bgGradient}
        overflow="hidden">
        <Container
          maxW="1200px"
          py={{ base: 20, md: 32 }}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="space-between"
            gap={10}>
            {/* Text Content */}
            <MotionFlex
              flex={1}
              direction="column"
              variants={containerVariants}
              initial="hidden"
              animate="visible">
              <MotionHeading
                as="h1"
                size="2xl"
                fontWeight="bold"
                mb={6}
                variants={itemVariants}>
                Connect, Share & Chat with{" "}
                <Text
                  as="span"
                  color="blue.400">
                  Nexus
                </Text>
              </MotionHeading>
              <MotionText
                fontSize="xl"
                mb={8}
                opacity={0.9}
                variants={itemVariants}>
                A modern social media platform powered by AI, built for
                real-time interactions and seamless content sharing.
              </MotionText>
              <MotionBox variants={itemVariants}>
                <Button
                  as={RouterLink}
                  to={user ? "/" : "/auth"}
                  size="lg"
                  colorScheme="blue"
                  px={8}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}>
                  {user ? "Go to Feed" : "Get Started"}
                </Button>
              </MotionBox>
            </MotionFlex>

            {/* Floating Icons Section */}
            <MotionFlex
              flex={1}
              position="relative"
              height={{ base: "300px", md: "400px" }}
              justify="center"
              align="center">
              {/* Floating Icons */}
              <MotionBox
                position="absolute"
                top="10%"
                right="15%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                variants={floatingIconVariants}
                whileInView="animate"
                viewport={{ once: false }}>
                <MotionIcon
                  as={FaRegHeart}
                  w={{ base: 12, md: 16 }}
                  h={{ base: 12, md: 16 }}
                  color={iconColor}
                  filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                />
              </MotionBox>

              <MotionBox
                position="absolute"
                bottom="30%"
                left="15%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                variants={floatingIconReverseVariants}
                whileInView="animate"
                viewport={{ once: false }}>
                <MotionIcon
                  as={FaRegComment}
                  w={{ base: 14, md: 20 }}
                  h={{ base: 14, md: 20 }}
                  color={iconColor}
                  filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                />
              </MotionBox>

              <MotionBox
                position="absolute"
                top="40%"
                right="5%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                variants={rotateIconVariants}
                whileInView="animate"
                viewport={{ once: false }}>
                <MotionIcon
                  as={FaShare}
                  w={{ base: 10, md: 14 }}
                  h={{ base: 10, md: 14 }}
                  color={iconColor}
                  filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                />
              </MotionBox>

              <MotionBox
                position="absolute"
                bottom="10%"
                right="25%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                variants={floatingIconVariants}
                whileInView="animate"
                viewport={{ once: false }}>
                <MotionIcon
                  as={FaRegUserCircle}
                  w={{ base: 12, md: 16 }}
                  h={{ base: 12, md: 16 }}
                  color={iconColor}
                  filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                />
              </MotionBox>

              <MotionBox
                position="absolute"
                top="25%"
                left="5%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                variants={floatingIconReverseVariants}
                whileInView="animate"
                viewport={{ once: false }}>
                <MotionIcon
                  as={FaHashtag}
                  w={{ base: 10, md: 14 }}
                  h={{ base: 10, md: 14 }}
                  color={iconColor}
                  filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                />
              </MotionBox>

              <MotionBox
                position="absolute"
                top="60%"
                left="25%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                variants={rotateIconVariants}
                whileInView="animate"
                viewport={{ once: false }}>
                <MotionIcon
                  as={FaRegImage}
                  w={{ base: 11, md: 15 }}
                  h={{ base: 11, md: 15 }}
                  color={iconColor}
                  filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                />
              </MotionBox>

              <MotionBox
                position="absolute"
                bottom="50%"
                right="30%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                variants={floatingIconVariants}
                whileInView="animate"
                viewport={{ once: false }}>
                <MotionIcon
                  as={FaRegBell}
                  w={{ base: 10, md: 14 }}
                  h={{ base: 10, md: 14 }}
                  color={iconColor}
                  filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                />
              </MotionBox>
            </MotionFlex>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        bg={useColorModeValue("white", "#101010")}
        py={20}>
        <Container maxW="1200px">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            textAlign="center"
            mb={16}>
            <Heading
              as="h2"
              size="xl"
              mb={4}>
              Powerful Features Built for You
            </Heading>
            <Text
              fontSize="lg"
              maxW="700px"
              mx="auto"
              opacity={0.8}>
              Discover everything you can do with Nexus's feature-rich platform.
            </Text>
          </MotionBox>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={10}>
            {features.map((feature, index) => (
              <MotionBox
                key={index}
                as="article"
                bg={cardBg}
                p={8}
                rounded="lg"
                shadow="md"
                variants={featureCardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}>
                <Flex
                  direction="column"
                  align="flex-start">
                  <Flex
                    justify="center"
                    align="center"
                    w="50px"
                    h="50px"
                    rounded="full"
                    bg="blue.100"
                    color="blue.500"
                    mb={4}
                    _dark={{
                      bg: "blue.900",
                      color: "blue.200",
                    }}>
                    <Icon
                      as={feature.icon}
                      w={6}
                      h={6}
                    />
                  </Flex>
                  <Heading
                    as="h3"
                    size="md"
                    mb={3}>
                    {feature.title}
                  </Heading>
                  <Text opacity={0.8}>{feature.description}</Text>
                </Flex>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* AI Features Section */}
      <Box
        bg={useColorModeValue("gray.50", "gray.900")}
        py={20}
        position="relative"
        overflow="hidden">
        <MotionBox
          style={{ y: y2 }}
          position="absolute"
          right="-200px"
          top="0"
          w="600px"
          h="600px"
          rounded="full"
          bg="blue.400"
          filter="blur(180px)"
          opacity="0.2"
        />

        <Container
          maxW="1200px"
          position="relative"
          zIndex={1}>
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            gap={12}>
            <MotionBox
              flex={1}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}>
              <Heading
                as="h2"
                size="xl"
                mb={6}>
                Powered by AI Technology
              </Heading>
              <Text
                fontSize="lg"
                mb={6}
                opacity={0.8}>
                Nexus leverages cutting-edge AI to enhance your social
                experience:
              </Text>

              <Stack spacing={4}>
                {[
                  "AI-powered post enhancement",
                  "Smart content moderation",
                  "Chat suggestions with /ai command",
                  "Automatic image caption generation",
                  "Smart hashtag suggestions",
                ].map((feature, index) => (
                  <MotionFlex
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    align="center">
                    <Icon
                      as={BsAndroid}
                      color="blue.400"
                      mr={2}
                    />
                    <Text>{feature}</Text>
                  </MotionFlex>
                ))}
              </Stack>
            </MotionBox>

            <MotionFlex
              flex={1}
              justify="center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}>
              <Image
                src={"/dark-logo.png"}
                alt="Nexus Logo"
                width={{ base: "200px", md: "300px" }}
                filter="drop-shadow(0 0 20px rgba(66, 153, 225, 0.5))"
              />
            </MotionFlex>
          </Flex>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        bg={ctaBg}
        py={20}
        color="white">
        <Container maxW="1200px">
          <MotionFlex
            direction="column"
            align="center"
            textAlign="center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            <Heading
              as="h2"
              size="xl"
              mb={4}>
              Ready to Join the Conversation?
            </Heading>
            <Text
              fontSize="xl"
              maxW="700px"
              mb={8}
              opacity={0.9}>
              Start sharing, connecting and chatting with Nexus today.
            </Text>
            <Button
              as={RouterLink}
              to={user ? "/" : "/auth"}
              size="lg"
              bg="white"
              color="blue.500"
              _hover={{ bg: "gray.100" }}
              px={8}
              rounded="full">
              {user ? "Go to Your Feed" : "Sign Up Now"}
            </Button>
          </MotionFlex>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        bg={useColorModeValue("gray.100", "gray.800")}
        py={8}>
        <Container maxW="1200px">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            gap={4}>
            <Flex
              align="center"
              gap={2}>
              <Image
                src={"/dark-logo.png"}
                alt="Nexus Logo"
                w="50px"
              />
              <Text fontWeight="bold">Nexus</Text>
            </Flex>
            <Text
              fontSize="sm"
              opacity={0.7}>
              © {new Date().getFullYear()} Nexus. All rights reserved.
            </Text>
            <Flex gap={6}>
              <Link
                href="#"
                fontWeight="medium">
                Privacy
              </Link>
              <Link
                href="#"
                fontWeight="medium">
                Terms
              </Link>
              <Link
                href="#"
                fontWeight="medium">
                Contact
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
