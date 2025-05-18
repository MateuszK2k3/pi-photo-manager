import {useState, useRef, useCallback, useEffect} from "react";
import {
    Box,
    Button,
    Center,
    FormControl,
    FormLabel,
    HStack,
    Image,
    Input,
    Stack,
    Tag,
    TagCloseButton,
    TagLabel,
    Text,
    useColorModeValue,
    VStack,
    Wrap,
    WrapItem,
    CloseButton,
    Tooltip,
    Heading, useToast, UnorderedList, ListItem, Flex
} from "@chakra-ui/react";
import {AddIcon, DeleteIcon, EditIcon} from "@chakra-ui/icons";
import {usePhotoStore} from "../store/photo.js";

const CreatePage = () => {
    const [files, setFiles] = useState([]);
    const [duplicates, setDuplicates] = useState([]);
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");
    const [isAddingTag, setIsAddingTag] = useState(false);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    const toast = useToast()

    const {createPhoto, checkForDuplicates} = usePhotoStore()

    const verifyDuplicates = async () => {
        if (files.length === 0) return;

        const filenames = files.map(f => f.name);
        const { success, duplicates: dup } = await checkForDuplicates(filenames);

        if (success) {
            setDuplicates(dup || []);
            if (dup.length > 0) {
                toast({
                    title: "Warning",
                    description: `${dup.length} photos have the same name`,
                    status: "warning",
                    duration: 5000,
                    isClosable: true
                });
            }
        }
    };

    useEffect(() => {
        verifyDuplicates();
    }, [files]);

    const handleSubmit = async(e) => {
        e.preventDefault();

        if (files.length === 0) {
            toast({
                title: "Info",
                description: "Add some photos",
                status: "info",
                isClosable: true
            });
            return;
        }

        if (duplicates.length > 0) {
            toast({
                title: "Cant send photos",
                description: "Please remove or rename duplicated photos",
                status: "error",
                isClosable: true
            });
            return;
        }

        const photosData = files.map(file => ({
            filename: file.name,
            tags: [...tags],
        }));

        const {success, message} = await createPhoto(photosData);
        if(!success){
            toast({
                title: "Error",
                description: message,
                status: "error",
                isClosable: true
            })
        } else {
            toast({
                title: "Success",
                description: message,
                status: "success",
                isClosable: true
            })
            setFiles([])
            setTags([]);
            setDuplicates([]);
        }
    };

    const handleFilesChange = useCallback((e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...selectedFiles]);
            e.target.value = '';
        }
    }, []);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                setFiles(prev => [...prev, ...imageFiles]);
            }
        }
    }, []);

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleRemoveAllFiles = () => {
        setFiles([]);
    };

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

    const dropzoneStyle = {
        border: "2px dashed",
        borderColor: isDragging ? "blue.500" : useColorModeValue("gray.300", "gray.600"),
        borderRadius: "md",
        p: 16,
        textAlign: "center",
        cursor: "pointer",
        bg: isDragging
            ? useColorModeValue("blue.50", "blue.900")
            : useColorModeValue("gray.50", "gray.700"),
        _hover: {
            bg: !isDragging && useColorModeValue("gray.100", "gray.600"),
            borderColor: !isDragging && useColorModeValue("gray.400", "gray.500")
        },
        minH: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        position: "relative",
        "::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
        }
    };

    const renderFilePreviews = () => (
        <Box mt={4}>
            <HStack justify="space-between" mb={4}>
                <Text fontSize="md" fontWeight="medium">
                    Wybrane zdjęcia: {files.length}
                    {duplicates.length > 0 && (
                        <Text as="span" color="red.500" ml={2}>
                            ({duplicates.length} duplikatów)
                        </Text>
                    )}
                </Text>
                {files.length > 0 && (
                    <Button
                        leftIcon={<DeleteIcon />}
                        onClick={handleRemoveAllFiles}
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                    >
                        Usuń wszystkie
                    </Button>
                )}
            </HStack>
            {duplicates.length > 0 && (
                <Box bg="red.50" p={3} borderRadius="md" mb={4} border="1px solid" borderColor="red.100">
                    <Text color="red.600" fontWeight="medium" mb={2}>
                        Uwaga: Następujące pliki już istnieją w bazie:
                    </Text>
                    <UnorderedList color="red.600" fontSize="sm">
                        {duplicates.map((dup, index) => (
                            <ListItem key={index}>{dup}</ListItem>
                        ))}
                    </UnorderedList>
                </Box>
            )}


            <Wrap spacing={4}>
                {files.map((file, idx) => (
                    <WrapItem key={idx} position="relative">
                        <Box
                            position="relative"
                            boxSize="140px"
                            borderRadius="md"
                            overflow="hidden"
                            boxShadow="md"
                            border="3px solid"
                            borderColor={duplicates.includes(file.name) ? "red.500" : "transparent"}
                        >
                            <Image
                                src={URL.createObjectURL(file)}
                                alt={`preview ${idx}`}
                                objectFit="cover"
                                w="full"
                                h="100px"
                            />
                            <Box
                                p={2}
                                position="absolute"
                                bottom={0}
                                left={0}
                                right={0}
                            >
                                <Tooltip label={file.name}>
                                    <Text
                                        fontSize="xs"
                                        isTruncated
                                        fontWeight="medium"
                                    >
                                        {file.name.length > 20
                                            ? `${file.name.substring(0, 15)}...${file.name.split('.').pop()}`
                                            : file.name}
                                    </Text>
                                </Tooltip>
                            </Box>
                            <Flex
                                position="absolute"
                                top={1}
                                left={1}
                                right={1}
                                zIndex={2}
                                justifyContent="space-between"
                            >
                                <Button
                                    size="xs"
                                    bg="white"
                                    opacity={0.5}
                                    borderRadius="full"
                                    color="gray.800"
                                    _hover={{ bg: "white" , opacity: 1}}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        //TODO dodać obslugę edycji zdjęcia
                                        //handleEditFile(idx);e
                                    }}
                                >
                                    <EditIcon />
                                </Button>
                                <CloseButton
                                    size="sm"
                                    bg="white"
                                    opacity={0.5}
                                    borderRadius="full"
                                    color="gray.800"
                                    _hover={{ bg: "white" , opacity: 1}}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile(idx);
                                    }}
                                />
                            </Flex>

                        </Box>
                    </WrapItem>
                ))}
            </Wrap>
        </Box>
    );

    return (
        <Center py={8}>
            <Box
                w="full"
                maxW="600px"
                px={6}
                py={8}
                boxShadow="lg"
                borderRadius="xl"
                bg={useColorModeValue("white", "gray.700")}
            >
                <Heading
                    as="h1"
                    size="xl"
                    textAlign="center"
                    color={useColorModeValue("blue.600", "blue.300")}
                    mb={4}
                >
                    Add new photos
                </Heading>
                <VStack spacing={6} align="stretch">
                    <FormControl>
                        <FormLabel fontSize="lg" fontWeight="bold">Photos</FormLabel>
                        <Box
                            onClick={() => fileInputRef.current.click()}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            {...dropzoneStyle}
                        >
                            <VStack spacing={2} zIndex={2}>
                                <Text fontSize="lg" fontWeight="medium">
                                    {isDragging ? "Drop here" : "Drag or click to add a photo"}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    Add photos in JPG or PNG format.
                                </Text>
                            </VStack>
                        </Box>
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            display="none"
                            onChange={handleFilesChange}
                            ref={fileInputRef}
                        />
                    </FormControl>

                    {files.length > 0 && renderFilePreviews()}

                    <FormControl>
                        <FormLabel fontSize="lg" fontWeight="bold">Tags</FormLabel>
                        <Stack spacing={3}>
                            <HStack spacing={2} flexWrap="wrap">
                                {tags.map((tag, index) => (
                                    <Tag key={index} size="md" colorScheme="blue">
                                        <TagLabel>{tag}</TagLabel>
                                        <TagCloseButton onClick={() => handleRemoveTag(index)} />
                                    </Tag>
                                ))}
                                {isAddingTag ? (
                                    <Input
                                        placeholder="Wpisz tag"
                                        value={newTag}
                                        autoFocus
                                        size="sm"
                                        width="120px"
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onBlur={handleAddTag}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                                    />
                                ) : (
                                    <Button
                                        leftIcon={<AddIcon />}
                                        onClick={() => setIsAddingTag(true)}
                                        variant="outline"
                                        size="sm"
                                        colorScheme="blue"
                                    >
                                        Add
                                    </Button>
                                )}
                            </HStack>
                        </Stack>
                    </FormControl>

                    <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        mt={4}
                        onClick={handleSubmit}
                    >
                        Send photos
                    </Button>
                </VStack>
            </Box>
        </Center>
    );
};

export default CreatePage;