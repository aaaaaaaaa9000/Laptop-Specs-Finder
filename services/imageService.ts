import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateHeroImage = async (): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: 'A futuristic, abstract background with glowing circuit board patterns and data streams, in shades of deep blue and cyan, representing advanced technology and laptop specifications. Minimalist and sleek, 16:9 aspect ratio.',
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;

    } catch (error) {
        console.error("Image generation error:", error);
        // In a real app, you might want to return a fallback image URL here
        return null;
    }
};
