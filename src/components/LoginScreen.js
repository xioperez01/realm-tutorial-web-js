import React from "react";
import { Flex, Heading, Input, Box, Button, Container } from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import * as Realm from "realm-web";
import { useRealmApp } from "../RealmApp";
import styled from "@emotion/styled";
import { uiColors } from "@leafygreen-ui/palette";
import validator from "validator";
import Loading from "./Loading";

export default function LoginScreen() {
  const app = useRealmApp();
  // Toggle between logging users in and registering new users
  const [mode, setMode] = React.useState("login");
  const toggleMode = () => {
    setMode((oldMode) => (oldMode === "login" ? "register" : "login"));
  };
  // Keep track of form input state
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  // Keep track of input validation/errors
  const [error, setError] = React.useState({});
  // Whenever the mode changes, clear the form inputs
  React.useEffect(() => {
    setEmail("sampleemail@example.com");
    setPassword("password");
    setError({});
  }, [mode]);

  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError((e) => ({ ...e, password: null }));
    try {
      await app.logIn(Realm.Credentials.emailPassword(email, password));
    } catch (err) {
      handleAuthenticationError(err, setError);
    }
  };

  const handleRegistrationAndLogin = async () => {
    const isValidEmailAddress = validator.isEmail(email);
    setError((e) => ({ ...e, password: null }));
    if (isValidEmailAddress) {
      try {
        // Register the user and, if successful, log them in
        await app.emailPasswordAuth.registerUser(email, password);
        return await handleLogin();
      } catch (err) {
        handleAuthenticationError(err, setError);
      }
    } else {
      setError((err) => ({ ...err, email: "Email is invalid." }));
    }
  };

  return (
    <Container height="100vh" centerContent>
      {isLoggingIn ? (
        <Loading />
      ) : (
        <Box
          m="auto"
          p={3}
          backgroundColor="whitesmoke"
          rounded={6}
          shadow="dark-lg"
        >
          <Flex alignItems="center" justifyContent="center">
            <Heading mb="10px" fontSize="32px" fontFamily="sans-Serif">
              {mode === "login" ? "Log In" : "Register an Account"}
            </Heading>
          </Flex>
          <Flex direction="row" alignItems="center">
            <EmailIcon mr={3} color="blackAlpha.900" fontSize="20px" />
            <Input
              my={3}
              mr={3}
              variant="flushed"
              type="email"
              label="Email"
              placeholder="your.email@example.com"
              onChange={(e) => {
                setError((e) => ({ ...e, email: null }));
                setEmail(e.target.value);
              }}
              value={email}
              state={
                error.email
                  ? "error"
                  : validator.isEmail(email)
                  ? "valid"
                  : "none"
              }
              errorMessage={error.email}
            />
          </Flex>
          <Flex alignItems="center" justifyContent="center">
            <LockIcon mr={3} color="blackAlpha.900" fontSize="20px" />
            <Input
              my={3}
              mr={3}
              variant="flushed"
              type="password"
              label="Password"
              placeholder="pa55w0rd"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              value={password}
              state={
                error.password ? "error" : error.password ? "valid" : "none"
              }
              errorMessage={error.password}
            />
          </Flex>
          {mode === "login" ? (
            <Button
              colorScheme="whatsapp"
              width="100%"
              my={3}
              onClick={() => handleLogin()}
            >
              Log In
            </Button>
          ) : (
            <Button
              colorScheme="whatsapp"
              width="100%"
              my={3}
              onClick={() => handleRegistrationAndLogin()}
            >
              Register
            </Button>
          )}
          <ToggleContainer>
            <ToggleText>
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </ToggleText>
            <ToggleLink
              onClick={(e) => {
                e.preventDefault();
                toggleMode();
              }}
            >
              {mode === "login" ? "Register one now." : "Log in instead."}
            </ToggleLink>
          </ToggleContainer>
        </Box>
      )}
    </Container>
  );
}

function handleAuthenticationError(err, setError) {
  const { status, message } = parseAuthenticationError(err);
  const errorType = message || status;
  switch (errorType) {
    case "invalid username":
      setError((prevErr) => ({ ...prevErr, email: "Invalid email address." }));
      break;
    case "invalid username/password":
    case "invalid password":
    case "401":
      setError((err) => ({ ...err, password: "Incorrect password." }));
      break;
    case "name already in use":
    case "409":
      setError((err) => ({ ...err, email: "Email is already registered." }));
      break;
    case "password must be between 6 and 128 characters":
    case "400":
      setError((err) => ({
        ...err,
        password: "Password must be between 6 and 128 characters.",
      }));
      break;
    default:
      break;
  }
}

function parseAuthenticationError(err) {
  const parts = err.message.split(":");
  const reason = parts[parts.length - 1].trimStart();
  if (!reason) return { status: "", message: "" };
  const reasonRegex = /(?<message>.+)\s\(status (?<status>[0-9][0-9][0-9])/;
  const match = reason.match(reasonRegex);
  const { status, message } = match?.groups ?? {};
  return { status, message };
}

const ToggleContainer = styled.div`
  margin-top: 8px;
  font-size: 12px;
  display: flex;
  justify-content: center;
`;

const ToggleText = styled.span`
  line-height: 18px;
`;

const ToggleLink = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  color: ${uiColors.green.dark2};
`;
