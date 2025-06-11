// src/pages/GroupDetailsPage.jsx
import {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Center,
    Heading,
    Input,
    List,
    ListItem,
    Text,
    HStack,
    VStack,
    Avatar,
    IconButton,
    useToast,
    useColorModeValue
} from '@chakra-ui/react';
import { ArrowBackIcon, SmallAddIcon, CloseIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function GroupDetailsPage() {
    const { token, user } = useAuth();
    const { groupId }     = useParams();
    const nav             = useNavigate();
    const toast           = useToast();

    const [group, setGroup]           = useState(null);
    const [showAddForm, setShowAdd]   = useState(false);
    const [query, setQuery]           = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // Kolory motywów
    const bgPage  = useColorModeValue('gray.50', 'gray.900');
    const bgBox   = useColorModeValue('white', 'gray.800');
    const border  = useColorModeValue('gray.200', 'gray.700');
    const textClr = useColorModeValue('gray.800', 'gray.200');
    const hoverBg = useColorModeValue('gray.200', 'gray.600');
    const grayText = useColorModeValue('gray.600', 'gray.400');
    const textColor = useColorModeValue('gray.500', 'gray.500');

    // fetch grupy
    useEffect(() => {
        if (!token) return;
        fetch(`/api/groups/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(j => setGroup(j.data))
            .catch(e => toast({ title: 'Błąd', description: e.message, status: 'error' }));
    }, [groupId, token]);

    // live-search
    useEffect(() => {
        if (!showAddForm || query.length < 2) {
            setSuggestions([]);
            return;
        }

        const id = setTimeout(async () => {
            try {
                const response = await fetch(`/api/auth/search?query=${encodeURIComponent(query)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                setSuggestions(data.data || []);
            } catch (error) {
                setSuggestions([]);
                toast({
                    title: 'Błąd wyszukiwania',
                    description: 'Nie udało się wyszukać użytkowników',
                    status: 'error'
                });
            }
        }, 300);

        return () => clearTimeout(id);
    }, [query, showAddForm, token]);

    if (!group || !user) {
        return <Center h="80vh"><Text>Ładuję…</Text></Center>;
    }

    // POPRAWIONE: Prawidłowe porównanie identyfikatorów
    const ownerId = group.owner?._id || group.owner;
    const isAdmin = () => {
        // Pobierz ID właściciela grupy
        const ownerId = group.owner?._id || group.owner;

        // Spróbuj pobrać ID użytkownika z różnych możliwych właściwości
        const userId = user._id || user.id || (user.user && user.user._id);
        return String(ownerId) === String(userId);
    };

    const handleLeave = async () => {
        await fetch(`/api/groups/${groupId}/leave`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Opuściłeś grupę', status: 'info' });
        nav('/groups');
    };

    const handleAddUser = async (userId) => {
        try {
            const response = await fetch(`/api/groups/${groupId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Nie udało się wysłać zaproszenia');
            }

            toast({
                title: 'Sukces',
                description: data.message || 'Zaproszenie wysłane',
                status: 'success',
                duration: 5000,
                isClosable: true
            });

            setShowAdd(false);
            setQuery('');
            setSuggestions([]);

        } catch (error) {
            toast({
                title: 'Błąd',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        }
    };

    const handleRemove = async (uid) => {
        try {
            const response = await fetch(`/api/groups/${groupId}/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: uid })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Nie udało się usunąć');
            }

            // Aktualizuj stan grupy
            setGroup(prev => ({
                ...prev,
                members: prev.members.filter(m => m._id !== uid)
            }));

            toast({
                title: data.message || 'Sukces',
                status: 'success'
            });

        } catch (error) {
            toast({
                title: 'Błąd',
                description: error.message,
                status: 'error'
            });
        }
    };

    return (
        <Box bg={bgPage} minH="100vh" py={8}>
            <Center>
                <Box w="full" maxW="600px" bg={bgBox} p={6} borderRadius="md" border="1px" borderColor={border} boxShadow="md">

                    {/* Górny pasek: Powrót + Opuść */}
                    <HStack justify="space-between" mb={4}>
                        <Button leftIcon={<ArrowBackIcon />} variant="ghost" onClick={() => nav('/groups')}>
                            Powrót
                        </Button>
                        {!isAdmin && (
                            <Button colorScheme="red" onClick={handleLeave}>
                                Opuść grupę
                            </Button>
                        )}
                    </HStack>

                    {/* Tytuł i opis */}
                    <Heading mb={2} color={textClr}>{group.name}</Heading>
                    <Text mb={4} color={grayText}>{group.description}</Text>
                    <Text fontSize="sm" color={textColor} mb={6}>
                        Utworzono: {new Date(group.createdAt).toLocaleDateString()}
                    </Text>

                    {/* Dodaj użytkownika (tylko admin) */}
                    {isAdmin && (
                        <VStack mb={6} align="stretch">
                            <Button
                                leftIcon={<SmallAddIcon />}
                                onClick={() => setShowAdd(v => !v)}
                                variant="outline"
                                colorScheme="blue"
                            >
                                Dodaj użytkownika
                            </Button>
                            {showAddForm && (
                                <Box p={4} bg={useColorModeValue('gray.100','gray.700')} borderRadius="md">
                                    <Input
                                        placeholder="Wpisz login użytkownika"
                                        mb={2}
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        bg={useColorModeValue('white','gray.600')}
                                    />
                                    <List spacing={1} maxH="150px" overflowY="auto">
                                        {suggestions.map(u => (
                                            <ListItem
                                                key={u._id}
                                                p={2}
                                                _hover={{ bg: hoverBg }}
                                                cursor="pointer"
                                                onClick={() => handleAddUser(u._id)}
                                            >
                                                <HStack spacing={3}>
                                                    <Avatar size="sm" name={u.login} />
                                                    <Text color={textClr}>{u.login}</Text>
                                                </HStack>
                                            </ListItem>
                                        ))}
                                        {query.length >= 2 && suggestions.length === 0 && (
                                            <Text color="gray.500" fontSize="sm">Brak wyników</Text>
                                        )}
                                    </List>
                                </Box>
                            )}
                        </VStack>
                    )}

                    {/* Lista członków */}
                    <Text fontWeight="semibold" mb={2} color={textClr}>Członkowie:</Text>
                    <List spacing={2}>
                        {group.members.map(m => (
                            <ListItem key={m._id} p={3} bg={bgBox} borderRadius="md" border="1px" borderColor={border}>
                                <HStack justify="space-between">
                                    <HStack>
                                        <Avatar size="sm" name={m.login} />
                                        <VStack align="start" spacing={0}>
                                            <Text color={textClr}>{m.login}</Text>
                                            {String(m._id) === String(ownerId) && (
                                                <Text fontSize="xs" color="blue.500">Administrator</Text>
                                            )}
                                        </VStack>
                                    </HStack>
                                    {isAdmin && String(m._id) !== String(ownerId) && (
                                        <IconButton
                                            icon={<CloseIcon />}
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => handleRemove(m._id)}
                                        />
                                    )}
                                </HStack>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Center>
        </Box>
    );
}