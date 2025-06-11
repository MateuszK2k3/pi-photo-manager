// frontend/src/pages/HomePage.jsx

import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Spinner,
    Center,
    IconButton,
    Img,
    useBreakpointValue,
    Checkbox,
    CheckboxGroup,
    Stack,
    Text,
    Tag,
    Wrap,
    WrapItem,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button, RadioGroup, Radio, Select, HStack, Heading, VStack, Avatar, Tabs, TabList, Tab, Collapse, useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useAuth } from "../components/AuthContext";
import { Link as RouterLink } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import PhotoEditWindow from "../components/PhotoEditWindow";
import * as myGroups from "framer-motion/m";

const HomePage = () => {
    const { token, user } = useAuth();
    const [rawPhotos, setRawPhotos] = useState([]);
    const [photosWithSize, setPhotosWithSize] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTags, setSelectedTags] = useState([]);
    const [uniqueTags, setUniqueTags] = useState([]);
    const [editOpen, setEditOpen] = useState(false);
    const [editPhoto, setEditPhoto] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState(null);
    const cancelRef = useRef();
    const [view, setView] = useState('mine');
    const [myGroups, setMyGroups] = useState([]);
    const [groupFilter, setGroupFilter] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const toast = useToast();

    const bgPage  = useColorModeValue("white","gray.800");
    const panelBorder = useColorModeValue("gray.300","gray.600");

    const columns = useBreakpointValue({ base: 2, sm: 2, md: 3, lg: 5 });

    useEffect(() => {
        if (!token) return;

        fetch('/api/groups', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(j => {
                if (j.success) setMyGroups(j.data);
            });
    }, [token]);


    useEffect(() => {
        const fetchPhotos = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (view === 'group' && groupFilter) {
                    params.append('group', groupFilter);
                }

                const url = `/api/photos${params.toString() ? '?' + params.toString() : ''}`;
                const res = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setRawPhotos(json.data);
                    recalcUniqueTags(json.data);
                } else {
                    console.error("Niepoprawna odpowiedź z API:", json);
                }
            } catch (err) {
                console.error("Błąd pobierania zdjęć:", err);
                toast({
                    title: "Błąd",
                    description: "Nie udało się pobrać zdjęć",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        if (token && (view === 'mine' || (view === 'group' && groupFilter))) {
            fetchPhotos();

            // Pobierz informacje o wybranej grupie
            if (view === 'group' && groupFilter) {
                fetch(`/api/groups/${groupFilter}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(r => r.json())
                    .then(j => {
                        if (j.success) setSelectedGroup(j.data);
                    });
            } else {
                setSelectedGroup(null);
            }
        }
    }, [token, view, groupFilter]);

    // --- Przelicz unikalne tagi na podstawie rawPhotos ---
    const recalcUniqueTags = (photosArray) => {
        const tagsSet = new Set();
        photosArray.forEach((p) => {
            if (Array.isArray(p.tags)) {
                p.tags.forEach((tag) => tagsSet.add(tag));
            }
        });
        setUniqueTags(Array.from(tagsSet));
    };

    // --- Mierzenie wymiarów + dodanie tagów + filename ---
    useEffect(() => {
        if (rawPhotos.length === 0) return;

        const promises = rawPhotos.map((p) => {
            return new Promise((resolve) => {
                const img = new window.Image();
                const fullSrc = `${p.path}/${encodeURIComponent(p.filename)}`;
                img.src = fullSrc;
                img.onload = () => {
                    resolve({
                        id: p._id,
                        src: fullSrc,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        tags: Array.isArray(p.tags) ? p.tags : [],
                        filename: p.filename,
                        owner: p.owner
                    });
                };
                img.onerror = () => {
                    console.warn("Nie udało się załadować:", fullSrc);
                    resolve(null);
                };
            });
        });

        Promise.all(promises).then((results) => {
            const filtered = results.filter((x) => x !== null);
            setPhotosWithSize(filtered);
            setLoading(false);
        });
    }, [rawPhotos]);

    // --- Otwórz modal potwierdzenia usunięcia ---
    const handleDeleteClick = (photo) => {
        setPhotoToDelete(photo);
        setDeleteOpen(true);
    };

    // --- Potwierdzenie: wykonujemy DELETE ---
    const confirmDelete = async () => {
        if (!photoToDelete) {
            setDeleteOpen(false);
            return;
        }
        const photoId = photoToDelete.id;
        try {
            const res = await fetch(`/api/photos/${photoId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();
            if (json.success) {
                // 1) Usuń z rawPhotos
                const newRaw = rawPhotos.filter((p) => p._id !== photoId);
                setRawPhotos(newRaw);
                recalcUniqueTags(newRaw);

                // 2) Usuń z photosWithSize
                setPhotosWithSize((prev) => prev.filter((p) => p.id !== photoId));

                toast({
                    title: "Deleted",
                    description: "Photo was successfully deleted.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Error",
                    description: json.message || "Could not delete photo",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                console.error("Błąd przy usuwaniu:", json);
            }
        } catch (err) {
            console.error("DELETE /api/photos/:id błąd:", err);
            toast({
                title: "Error",
                description: "Server error while deleting photo",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setDeleteOpen(false);
            setPhotoToDelete(null);
        }
    };

    // --- Obsługa anulowania usunięcia ---
    const cancelDelete = () => {
        setDeleteOpen(false);
        setPhotoToDelete(null);
    };

    // --- Kliknięcie „Edytuj” ---
    const handleEditClick = (photo) => {
        setEditPhoto(photo);
        setEditOpen(true);
    };

    // --- Zapisanie zmian z modala edycji ---
    const handleSaveEdit = async ({ name: newName, tags: newTags }) => {
        if (!editPhoto) return;
        const photoId = editPhoto.id;
        try {
            const res = await fetch(`/api/photos/${photoId}`, {
                method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                body: JSON.stringify({
                    filename: newName,
                    tags: newTags,
                }),
            });
            const json = await res.json();
            if (!json.success) {
                toast({
                    title: "Error",
                    description: json.message || "Could not update photo",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            const updated = json.data;
            // 1) rawPhotos
            const newRaw = rawPhotos.map((p) =>
                p._id === photoId
                    ? { ...p, filename: updated.filename, tags: updated.tags }
                    : p
            );
            setRawPhotos(newRaw);
            recalcUniqueTags(newRaw);

            // 2) photosWithSize
            setPhotosWithSize((prev) =>
                prev.map((p) => {
                    if (p.id === photoId) {
                        const basePath = p.src.substring(0, p.src.lastIndexOf("/") + 1);
                        const newSrc = `${basePath}${encodeURIComponent(
                            updated.filename
                        )}`;
                        return {
                            ...p,
                            src: newSrc,
                            tags: updated.tags,
                            filename: updated.filename,
                        };
                    }
                    return p;
                })
            );

            toast({
                title: "Updated",
                description: "Photo successfully updated.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            setEditOpen(false);
            setEditPhoto(null);
        } catch (err) {
            console.error("PUT /api/photos/:id błąd:", err);
            toast({
                title: "Error",
                description: "Server error while updating photo",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // --- Spinner podczas ładowania ---
    if (loading) {
        return (<Center h="80vh"><Spinner size="xl"/></Center>);
    }

    if (photosWithSize.length === 0) {
        return (
            <Center h="80vh" flexDir="column" textAlign="center" px={4}>
                <Text fontSize="2xl" mb={4}>Brak zdjęć w Twojej galerii.</Text>
                <Button as={RouterLink} to="/create" colorScheme="blue" size="lg">
                    Dodaj pierwsze zdjęcia
                </Button>
            </Center>
        );
    }

    // --- Filtrujemy po tagach ---
    const filteredPhotos = photosWithSize.filter((photo) => {
        if (selectedTags.length === 0) return true;
        return photo.tags.some((t) => selectedTags.includes(t));
    });

    return (
        <>
            <Box px={{ base: "8px", sm: "12px", md: "16px", lg: "32px" }} mb="4">
                <Tabs
                    index={view === "group" ? 1 : 0}
                    onChange={(i) => setView(i === 0 ? "mine" : "group")}
                    variant="line"            // mniej wyróżniający się
                    colorScheme="gray"        // neutralny kolor
                    isFitted
                    mb={2}
                >
                    <TabList borderBottomColor={panelBorder}>
                        <Tab>Moje zdjęcia</Tab>
                        <Tab>Zdjęcia grupy</Tab>
                    </TabList>
                </Tabs>

                <Collapse in={view === "group"} animateOpacity>
                    <Box
                        mb={4}
                        p={4}
                        bg={bgPage}             // takie samo tło jak strona
                        border="1px solid"
                        borderColor={panelBorder}
                        borderRadius="md"
                    >
                        {selectedGroup && (
                            <VStack align="start" spacing={1} mb={3}>
                                <Heading size="md">{selectedGroup.name}</Heading>
                                <Text color={useColorModeValue("gray.600","gray.400")}>
                                    {selectedGroup.description || "Brak opisu"}
                                </Text>
                            </VStack>
                        )}
                        <Select
                            placeholder="Wybierz grupę"
                            mb={2}
                            value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value)}
                        >
                            {myGroups.map((g) => (
                                <option key={g._id} value={g._id}>
                                    {g.name}
                                </option>
                            ))}
                        </Select>
                    </Box>
                </Collapse>

                {/* Filtr tagów zawsze pod zakładkami */}
                <Box mb={6}>
                    <Text mb="4px" fontWeight="semibold">
                        Filtruj po tagach:
                    </Text>
                    <CheckboxGroup
                        colorScheme="blue"
                        value={selectedTags}
                        onChange={setSelectedTags}
                    >
                        <Stack
                            direction={{ base: "column", sm: "row" }}
                            spacing="12px"
                            wrap="wrap"
                        >
                            {uniqueTags.map((tag) => (
                                <Checkbox key={tag} value={tag}>
                                    {tag}
                                </Checkbox>
                            ))}
                        </Stack>
                    </CheckboxGroup>
                </Box>
            </Box>

            <Box px={{ base: "8px", sm: "12px", md: "16px", lg: "32px" }}>
                <Box
                    sx={{
                        columnCount: columns ?? 1,
                        columnGap: "20px",
                    }}
                >
                    {filteredPhotos.map((photo, index) => (
                        <Box
                            key={photo.id}
                            as="figure"
                            display="inline-block"
                            width="100%"
                            mb="20px"
                            position="relative"
                            cursor="pointer"
                            overflow="hidden"
                            role="group"
                            borderRadius="8px"
                            onClick={() => {
                                setCurrentIndex(index);
                                setLightboxOpen(true);
                            }}
                        >
                            {view === 'group' && (
                                <Box
                                    position="absolute"
                                    top="4px"
                                    left="4px"
                                    display="none"
                                    _groupHover={{ display: "flex" }}
                                    alignItems="center"
                                    bg="rgba(0, 0, 0, 0.6)"
                                    px="6px"
                                    py="2px"
                                    borderRadius="md"
                                    zIndex={2}
                                >
                                    <HStack spacing="4px">
                                        <Avatar size="xs" name={photo.owner.login} />
                                        <Text fontSize="xs" color="white">
                                            {photo.owner.login}
                                        </Text>
                                    </HStack>
                                </Box>
                            )}
                            <Img
                                src={photo.src}
                                alt={`Photo-${photo.id}`}
                                objectFit="cover"
                                width="100%"
                                height="auto"
                                transition="transform 0.3s ease-in-out"
                                _groupHover={{ transform: "scale(1.05)" }}
                            />

                            {/* Przycisk „Usuń” i „Edytuj” */}
                            <Box
                                position="absolute"
                                top="8px"
                                right="8px"
                                display="flex"
                                gap="4px"
                                opacity="0"
                                _groupHover={{ opacity: 1 }}
                                transition="opacity 0.2s"
                            >
                                <IconButton
                                    aria-label="Usuń"
                                    size="sm"
                                    bg="white"
                                    opacity={0.5}
                                    color="gray.800"
                                    _hover={{ bg: "white", opacity: 1 }}
                                    icon={<DeleteIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(photo);
                                    }}
                                />
                                <IconButton
                                    aria-label="Edytuj"
                                    size="sm"
                                    bg="white"
                                    opacity={0.5}
                                    color="gray.800"
                                    _hover={{ bg: "white", opacity: 1 }}
                                    icon={<EditIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(photo);
                                    }}
                                />
                            </Box>

                            {/* Tagi */}
                            {photo.tags.length > 0 && (
                                <Box
                                    position="absolute"
                                    bottom="8px"
                                    left="8px"
                                    right="8px"
                                    borderRadius="4px"
                                    px="8px"
                                    py="4px"
                                    opacity="0"
                                    _groupHover={{ opacity: 1 }}
                                    transition="opacity 0.2s"
                                >
                                    <Wrap spacing="4px">
                                        {photo.tags.map((tag) => (
                                            <WrapItem key={tag}>
                                                <Tag size="sm" variant="solid" colorScheme="gray">
                                                    {tag}
                                                </Tag>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>

            {lightboxOpen && (
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    slides={filteredPhotos.map((p) => ({ src: p.src }))}
                    index={currentIndex}
                    styles={{
                        container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
                        slide: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        },
                        image: {
                            objectFit: "contain",
                            maxHeight: "95vh",
                            maxWidth: "95vw",
                        },
                    }}
                />
            )}

            <PhotoEditWindow
                isOpen={editOpen}
                onClose={() => {
                    setEditOpen(false);
                    setEditPhoto(null);
                }}
                imageSrc={editPhoto?.src}
                initialName={editPhoto?.filename?.replace(/\.[^/.]+$/, "") || ""}
                initialTags={editPhoto?.tags || []}
                onSave={handleSaveEdit}
                file={null}
            />

            <AlertDialog
                isOpen={deleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={cancelDelete}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Photo
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete this photo? This action cannot be
                            undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={cancelDelete}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default HomePage;
