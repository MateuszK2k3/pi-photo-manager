// frontend/src/components/PhotoEditWindow.jsx

import React, { useEffect, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Tag,
    TagLabel,
    TagCloseButton,
    HStack,
    Stack,
    Image,
    Text,
    useToast,
    Flex,
    useColorModeValue,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

const PhotoEditWindow = ({
                             isOpen,
                             onClose,
                             file,
                             imageSrc,
                             initialName,
                             initialTags = [],
                             onSave,
                         }) => {
    const [name, setName] = useState(initialName);
    const [tags, setTags] = useState(initialTags);
    const [newTag, setNewTag] = useState("");
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [fileInfo, setFileInfo] = useState(null); // { size, type, lastModified }
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setTags(initialTags);
            setNewTag("");
            setIsAddingTag(false);
            setFileInfo(null);

            // Jeśli mamy imageSrc (czyli edycja istniejącego zdjęcia),
            // pobierzemy nagłówki HEAD, by uzyskać content-length i last-modified
            if (imageSrc) {
                fetch(imageSrc, { method: "HEAD" })
                    .then((res) => {
                        const sizeHeader = res.headers.get("content-length");
                        const lastModHeader = res.headers.get("last-modified");
                        const typeHeader = res.headers.get("content-type");
                        const sizeKB = sizeHeader
                            ? `${(Number(sizeHeader) / 1024).toFixed(2)} KB`
                            : "—";
                        const type = typeHeader || "—";
                        const lastModified = lastModHeader
                            ? new Date(lastModHeader).toLocaleDateString()
                            : "—";
                        setFileInfo({ size: sizeKB, type, lastModified });
                    })
                    .catch(() => {
                        // Jeśli HEAD się nie powiedzie, po prostu nic nie ustawiamy
                        setFileInfo(null);
                    });
            }
        }
    }, [isOpen, initialName, initialTags, imageSrc]);

    const handleAddTag = () => {
        const trimmed = newTag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed]);
        }
        setNewTag("");
        setIsAddingTag(false);
    };

    const handleRemoveTag = (index) => {
        setTags((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Photo name cannot be empty",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        onSave({
            name: name.trim(),
            tags: [...tags],
        });
        // Zamykanie modala zostawiamy HomePage (po otrzymaniu odpowiedzi)
    };

    // Kolory:
    const bgColor = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
    const subtleTextColor = useColorModeValue("gray.600", "gray.400");
    const detailBg = useColorModeValue("gray.50", "gray.600");
    const tagBg = useColorModeValue("blue.100", "blue.800");
    const tagText = useColorModeValue("blue.800", "blue.100");

    // Funkcja pomocnicza: pobierz dane z obiektu File
    const getLocalFileInfo = () => {
        if (!file) return null;
        return {
            size: `${(file.size / 1024).toFixed(2)} KB`,
            type: file.type,
            lastModified: new Date(file.lastModified).toLocaleDateString(),
        };
    };
    const localInfo = getLocalFileInfo();

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent bg={bgColor}>
                <ModalHeader color={textColor}>Edit Photo</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={6}>
                        {/* ==== Podgląd zdjęcia ==== */}
                        <Box
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                            overflow="hidden"
                        >
                            <Image
                                src={imageSrc ? imageSrc : file ? URL.createObjectURL(file) : ""}
                                alt={`Preview of ${name}`}
                                objectFit="contain"
                                maxH="300px"
                                w="full"
                                bg={detailBg}
                            />
                        </Box>

                        {/* ==== Nazwa ==== */}
                        <FormControl>
                            <FormLabel color={textColor} fontWeight="semibold">
                                Photo Name
                            </FormLabel>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter photo name"
                                color={textColor}
                                borderColor={borderColor}
                                _hover={{ borderColor: borderColor }}
                                _focus={{ borderColor: "blue.500" }}
                            />
                        </FormControl>

                        {/* ==== Tagi ==== */}
                        <FormControl>
                            <FormLabel color={textColor} fontWeight="semibold">
                                Tags
                            </FormLabel>
                            <HStack spacing={2} flexWrap="wrap" mb={2}>
                                {tags.map((tag, idx) => (
                                    <Tag
                                        key={idx}
                                        size="md"
                                        bg={tagBg}
                                        color={tagText}
                                        borderRadius="full"
                                    >
                                        <TagLabel>{tag}</TagLabel>
                                        <TagCloseButton
                                            color={tagText}
                                            onClick={() => handleRemoveTag(idx)}
                                        />
                                    </Tag>
                                ))}
                            </HStack>
                            <Flex>
                                {isAddingTag ? (
                                    <Input
                                        placeholder="Add tag"
                                        value={newTag}
                                        autoFocus
                                        size="sm"
                                        width="150px"
                                        color={textColor}
                                        borderColor={borderColor}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onBlur={handleAddTag}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                                    />
                                ) : (
                                    <Button
                                        leftIcon={<AddIcon boxSize={3} />}
                                        onClick={() => setIsAddingTag(true)}
                                        variant="ghost"
                                        size="sm"
                                        colorScheme="blue"
                                    >
                                        Add Tag
                                    </Button>
                                )}
                            </Flex>
                        </FormControl>

                        {/* ==== Dane pliku ==== */}
                        {/* Jeśli mamy obiekt `file`, wyświetlamy dane lokalnego pliku. */}
                        {/* W przeciwnym wypadku (edycja galerii), wyświetlamy dane z nagłówka HEAD. */}
                        {(localInfo || fileInfo) && (
                            <Box
                                border="1px solid"
                                borderColor={borderColor}
                                borderRadius="md"
                                p={4}
                                bg={detailBg}
                            >
                                <Text color={textColor} fontWeight="semibold" mb={3}>
                                    Photo Details
                                </Text>
                                <Stack spacing={3}>
                                    <Flex justify="space-between" align="center">
                                        <Text color={subtleTextColor}>Size:</Text>
                                        <Text color={textColor}>
                                            {localInfo ? localInfo.size : fileInfo.size}
                                        </Text>
                                    </Flex>
                                    <Flex justify="space-between" align="center">
                                        <Text color={subtleTextColor}>Type:</Text>
                                        <Text color={textColor}>
                                            {localInfo
                                                ? localInfo.type.split("/")[1].toUpperCase()
                                                : fileInfo.type.split("/")[1].toUpperCase()}
                                        </Text>
                                    </Flex>
                                    <Flex justify="space-between" align="center">
                                        <Text color={subtleTextColor}>Modified:</Text>
                                        <Text color={textColor}>
                                            {localInfo ? localInfo.lastModified : fileInfo.lastModified}
                                        </Text>
                                    </Flex>
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </ModalBody>

                <ModalFooter borderTop="1px solid" borderColor={borderColor} bg={bgColor}>
                    <Button
                        variant="outline"
                        mr={3}
                        onClick={() => {
                            onClose();
                        }}
                        borderColor={borderColor}
                        _hover={{ bg: detailBg }}
                    >
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave}>
                        Save Changes
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default PhotoEditWindow;
