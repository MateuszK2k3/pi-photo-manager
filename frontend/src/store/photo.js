import { create } from "zustand"

export const usePhotoStore = create((set) => ({
    photos: [],
    setPhotos: (photos) => set({ photos }),
    checkForDuplicates: async (filenames) => {
        const res = await fetch("/api/photos/check-duplicates", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ filenames })
        });
        return await res.json();
    },

    createPhoto: async (newPhoto) => {
        try {
            const res = await fetch("/api/photos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newPhoto) // Ensure this matches backend expectations
            });

            if (!res.ok) {
                const errorDetails = await res.text();
                console.error("Backend error response:", errorDetails);
                throw new Error(errorDetails || 'Bad Request');
            }

            const data = await res.json();
            set((state) => ({photos: [...state.photos, data.data]}));
            return {success: true, message: 'Photos added successfully.'};
        } catch (error) {
            console.error("Request failed:", error);
            return {
                success: false,
                message: error.message.includes('400')
                    ? 'Invalid request data. Please check your input.'
                    : error.message
            };
        }
    },
}))
