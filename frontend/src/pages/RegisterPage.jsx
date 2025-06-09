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
    useColorModeValue,
    useToast,
    FormErrorMessage,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [form, setForm] = useState({ login: "", password: "", confirmPassword: "" });
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast({ title: "Błąd", description: "Hasła muszą być takie same.", status: "error", duration: 5000, isClosable: true });
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login: form.login, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Rejestracja nie powiodła się");
            toast({ title: "Konto utworzone", description: "Możesz się teraz zalogować.", status: "success", duration: 5000, isClosable: true });
            navigate("/login");
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
                <Heading as="h1" size="xl" textAlign="center" mb={6} color={useColorModeValue("blue.600", "blue.300")}>Rejestracja</Heading>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        <FormControl id="login" isRequired>
                            <FormLabel>Login</FormLabel>
                            <Input name="login" value={form.login} onChange={handleChange} placeholder="Twój login" />
                        </FormControl>
                        <FormControl id="password" isRequired>
                            <FormLabel>Hasło</FormLabel>
                            <Input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Hasło" />
                        </FormControl>
                        <FormControl id="confirmPassword" isRequired isInvalid={form.password && form.password !== form.confirmPassword}>
                            <FormLabel>Potwierdź hasło</FormLabel>
                            <Input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Potwierdź hasło" />
                            {form.password !== form.confirmPassword && <FormErrorMessage>Hasła nie są zgodne</FormErrorMessage>}
                        </FormControl>
                        <Button type="submit" colorScheme="blue" size="lg" isLoading={isLoading}>Zarejestruj się</Button>
                    </Stack>
                </form>
            </Box>
        </Center>
    );
};

export default RegisterPage;