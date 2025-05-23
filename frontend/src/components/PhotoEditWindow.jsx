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
    useColorModeValue
} from "@chakra-ui/react";
import { useState } from "react";
import { AddIcon } from "@chakra-ui/icons";

const PhotoEditWindow = ({
                             isOpen,
                             onClose,
                             file,
                             initialName,
                             initialTags = [],
                             onSave
                         }) => {
    const [name, setName] = useState(initialName);
    const [tags, setTags] = useState(initialTags);
    const [newTag, setNewTag] = useState("");
    const [isAddingTag, setIsAddingTag] = useState(false);
    const toast = useToast();

    // Kolory dla trybu nocnego/dziennego
    const bgColor = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
    const subtleTextColor = useColorModeValue("gray.600", "gray.400");
    const detailBg = useColorModeValue("gray.50", "gray.600");
    const tagBg = useColorModeValue("blue.100", "blue.800");
    const tagText = useColorModeValue("blue.800", "blue.100");

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
        setIsAddingTag(false);
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
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
        onClose();
    };

    const getImageInfo = () => {
        if (!file) return null;

        return {
            size: `${(file.size / 1024).toFixed(2)} KB`,
            type: file.type,
            lastModified: new Date(file.lastModified).toLocaleDateString(),
        };
    };

    const imageInfo = getImageInfo();

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent bg={bgColor}>
                <ModalHeader color={textColor}>Edit Photo</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={6}>
                        {/* Podgląd zdjęcia */}
                        <Box
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                            overflow="hidden"
                        >
                            <Image
                                src={file ? URL.createObjectURL(file) : ""}
                                alt={`Preview of ${name}`}
                                objectFit="contain"
                                maxH="300px"
                                w="full"
                                bg={detailBg}
                            />
                        </Box>

                        {/* Nazwa zdjęcia */}
                        <FormControl>
                            <FormLabel color={textColor} fontWeight="semibold">Photo Name</FormLabel>
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

                        {/* Tagi */}
                        <FormControl>
                            <FormLabel color={textColor} fontWeight="semibold">Tags</FormLabel>
                            <HStack spacing={2} flexWrap="wrap" mb={2}>
                                {tags.map((tag, index) => (
                                    <Tag
                                        key={index}
                                        size="md"
                                        bg={tagBg}
                                        color={tagText}
                                        borderRadius="full"
                                    >
                                        <TagLabel>{tag}</TagLabel>
                                        <TagCloseButton
                                            color={tagText}
                                            onClick={() => handleRemoveTag(index)}
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

                        {/* Dane zdjęcia */}
                        {imageInfo && (
                            <Box
                                border="1px solid"
                                borderColor={borderColor}
                                borderRadius="md"
                                p={4}
                                bg={detailBg}
                            >
                                <Text
                                    color={textColor}
                                    fontWeight="semibold"
                                    mb={3}
                                >
                                    Photo Details
                                </Text>
                                <Stack spacing={3}>
                                    <Flex justify="space-between" align="center">
                                        <Text color={subtleTextColor}>Size:</Text>
                                        <Text color={textColor}>{imageInfo.size}</Text>
                                    </Flex>
                                    <Flex justify="space-between" align="center">
                                        <Text color={subtleTextColor}>Type:</Text>
                                        <Text color={textColor}>
                                            {imageInfo.type.split('/')[1].toUpperCase()}
                                        </Text>
                                    </Flex>
                                    <Flex justify="space-between" align="center">
                                        <Text color={subtleTextColor}>Modified:</Text>
                                        <Text color={textColor}>
                                            {imageInfo.lastModified}
                                        </Text>
                                    </Flex>
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </ModalBody>

                <ModalFooter
                    borderTop="1px solid"
                    borderColor={borderColor}
                    bg={bgColor}
                >
                    <Button
                        variant="outline"
                        mr={3}
                        onClick={onClose}
                        borderColor={borderColor}
                        _hover={{ bg: detailBg }}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default PhotoEditWindow;