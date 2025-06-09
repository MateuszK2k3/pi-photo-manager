import { useState } from "react";
import {
    Box,
    Button,
    Center,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Text,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import {useNavigate, Link as RouterLink, useLocation} from "react-router-dom";
import {useAuth} from "../components/AuthContext.jsx";

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ login: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();  // Przeniesione na górę
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login: credentials.login, password: credentials.password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Logowanie nie powiodło się");
            login(data.token, data.login);
            toast({ title: "Witaj ponownie!", status: "success", duration: 5000, isClosable: true });
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err) {
            toast({ title: "Błąd", description: err.message, status: "error", duration: 5000, isClosable: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Center py={8}>
            <Box
                w="full"
                maxW="md"
                p={6}
                boxShadow="lg"
                borderRadius="xl"
                bg={useColorModeValue("white", "gray.700")}
            >
                <Heading as="h1" size="xl" textAlign="center" mb={6} color={useColorModeValue("blue.600", "blue.300")}>Logowanie</Heading>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        <FormControl id="login" isRequired>
                            <FormLabel>Login</FormLabel>
                            <Input name="login" value={credentials.login} onChange={handleChange} placeholder="Twój login" />
                        </FormControl>
                        <FormControl id="password" isRequired>
                            <FormLabel>Hasło</FormLabel>
                            <Input type="password" name="password" value={credentials.password} onChange={handleChange} placeholder="Hasło" />
                        </FormControl>
                        <Button type="submit" colorScheme="blue" size="lg" isLoading={isLoading}>Zaloguj się</Button>
                    </Stack>
                </form>
                <Text mt={4} textAlign="center">
                    Nie posiadasz konta?{' '}
                    <RouterLink to="/register" style={{ color: '#3182ce', fontWeight: 'bold' }}>
                        Zarejestruj się
                    </RouterLink>
                </Text>
            </Box>
        </Center>
    );
};

export default LoginPage;