import { useEffect, useState } from 'react';
import {
    Box, Button, Center, Heading, Input, List, ListItem, Text,
    VStack, HStack, useToast, Badge, IconButton
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GroupsPage() {
    const { token, user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [invitations, setInvitations] = useState([]);
    const [loadingInvites, setLoadingInvites] = useState(true);
    const toast = useToast();
    const nav = useNavigate();

    // Pobierz listę grup
    useEffect(() => {
        if (!token) return;

        fetch('/api/groups', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(j => setGroups(j.data))
            .catch(e => console.error(e));
    }, [token]);

    // Pobierz zaproszenia
    useEffect(() => {
        if (!token || !user?._id) {
            console.log(token, user)
            setLoadingInvites(false);
            return;
        }

        console.log('Pobieranie zaproszeń dla user._id:', user._id);

        const fetchInvitations = async () => {
            try {
                const response = await fetch(`/api/auth/${user._id}/invitations`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Otrzymane dane:', data);

                setInvitations(data.data || []);
            } catch (error) {
                console.error('Błąd pobierania zaproszeń:', error);
            } finally {
                setLoadingInvites(false);
            }
        };

        fetchInvitations();
    }, [token, user?._id]);

    const handleCreate = async () => {
        const res = await fetch('/api/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name, description: desc })
        });

        if (!res.ok) {
            toast({ title: 'Błąd tworzenia', status: 'error' });
        } else {
            const j = await res.json();
            setGroups(g => [...g, j.data]);
            setName('');
            setDesc('');
            toast({ title: 'Grupa utworzona', status: 'success' });
        }
    };

    const handleAcceptInvite = async (groupId) => {
        try {
            const response = await fetch(`/api/groups/${groupId}/accept-invite`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Nie udało się zaakceptować zaproszenia');
            }

            setInvitations(inv => inv.filter(i => i.group._id !== groupId));

            const groupResponse = await fetch('/api/groups', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const groupData = await groupResponse.json();
            setGroups(groupData.data);

            toast({
                title: 'Dołączono do grupy',
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

    const handleRejectInvite = async (groupId) => {
        try {
            const response = await fetch(`/api/groups/${groupId}/reject-invite`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Nie udało się odrzucić zaproszenia');
            }

            setInvitations(inv => inv.filter(i => i.group._id !== groupId));
            toast({ title: 'Odrzucono zaproszenie', status: 'info' });

        } catch (error) {
            toast({
                title: 'Błąd',
                description: error.message,
                status: 'error'
            });
        }
    };

    return (
        <Center py={8} gap={6} alignItems="flex-start">
            {/* Główna zawartość - grupy */}
            <VStack spacing={6} w="full" maxW="600px">
                <Heading>Twoje grupy</Heading>
                <List w="full" spacing={3}>
                    {groups.map(g => (
                        <ListItem
                            key={g._id}
                            p={3}
                            borderWidth="1px"
                            borderRadius="md"
                        >
                            <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold">{g.name}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {g.description || 'Brak opisu'}
                                    </Text>
                                </VStack>
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => nav(`/groups/${g._id}`)}
                                >
                                    Wejdź
                                </Button>
                            </HStack>
                        </ListItem>
                    ))}
                </List>

                <Box w="full" p={4} boxShadow="md" borderRadius="md" borderWidth="1px">
                    <Text mb={3} fontWeight="semibold" fontSize="lg">
                        Utwórz nową grupę
                    </Text>
                    <Input
                        placeholder="Nazwa grupy"
                        mb={2}
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <Input
                        placeholder="Opis (opcjonalnie)"
                        mb={3}
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                    />
                    <Button
                        colorScheme="blue"
                        onClick={handleCreate}
                        isDisabled={!name.trim()}
                    >
                        Utwórz
                    </Button>
                </Box>
            </VStack>

            {/* Panel powiadomień */}
            <Box
                w="350px"
                p={4}
                boxShadow="lg"
                borderRadius="md"
                borderWidth="1px"
                position="sticky"
                top="4"
            >
                <HStack justify="space-between" mb={4}>
                    <Heading size="md">Powiadomienia</Heading>
                    <Badge colorScheme="blue">{invitations.length}</Badge>
                </HStack>

                {loadingInvites ? (
                    <Center h="100px">
                        <Text>Ładowanie powiadomień...</Text>
                    </Center>
                ) : invitations.length === 0 ? (
                    <Center h="100px">
                        <Text color="gray.500">Brak nowych powiadomień</Text>
                    </Center>
                ) : (
                    <List spacing={3}>
                        {invitations.map(invite => (
                            <ListItem
                                key={invite._id}
                                p={3}
                                borderWidth="1px"
                                borderRadius="md"
                            >
                                <VStack align="start" spacing={2}>
                                    <HStack justify="space-between" w="full">
                                        <Text fontWeight="bold">
                                            Zaproszenie do: {invite.group.name}
                                        </Text>
                                        <IconButton
                                            icon={<CloseIcon />}
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => handleRejectInvite(invite.group._id)}
                                        />
                                    </HStack>
                                    <Text fontSize="sm">
                                        Od: {invite.owner.login}
                                    </Text>
                                    <Button
                                        size="sm"
                                        colorScheme="green"
                                        onClick={() => handleAcceptInvite(invite.group._id)}
                                    >
                                        Akceptuj
                                    </Button>
                                </VStack>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Center>
    );
}