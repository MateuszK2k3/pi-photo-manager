import {
    Button, Container, Flex, HStack, Text, useColorMode, useColorModeValue
} from '@chakra-ui/react';
import { PlusSquareIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LuSun } from 'react-icons/lu';
import { IoMoon } from 'react-icons/io5';
import { useAuth } from './AuthContext';

const Navbar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container maxW="1140px" px={4}>
            <Flex
                h={16}
                alignItems="center"
                justifyContent="space-between"
                flexDir={{ base: 'column', sm: 'row' }}
            >
                <Text
                    fontSize={{ base: '22', sm: '28' }}
                    fontWeight="bold"
                    textTransform="uppercase"
                    textAlign="center"
                    bgGradient="linear(to-r, cyan.500, purple.500)"
                    bgClip="text"
                >
                    <RouterLink to="/">Gallery</RouterLink>
                </Text>

                <HStack spacing={2} alignItems="center">
                    {!user ? (
                        <>
                            <RouterLink to="/login">
                                <Button variant="outline" size="sm">
                                    Log In
                                </Button>
                            </RouterLink>
                            <RouterLink to="/register">
                                <Button colorScheme="blue" size="sm">
                                    Sign Up
                                </Button>
                            </RouterLink>
                        </>
                    ) : (
                        <>
                            <Text fontWeight="semibold">Witaj, {user.login}!</Text>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    )}

                    <RouterLink to="/create">
                        <Button bg={useColorModeValue('white', 'whiteAlpha.200')}>
                            <PlusSquareIcon fontSize={20} />
                        </Button>
                    </RouterLink>
                    <Button
                        onClick={toggleColorMode}
                        bg={useColorModeValue('white', 'whiteAlpha.200')}
                    >
                        {colorMode === 'light' ? <IoMoon /> : <LuSun size={20} />}
                    </Button>
                </HStack>
            </Flex>
        </Container>
    );
};

export default Navbar;
