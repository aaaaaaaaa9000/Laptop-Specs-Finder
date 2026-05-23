export const generateHeroImage = async (): Promise<string | null> => {
    try {
        const response = await fetch('/api/hero-image');
        
        if (response.ok) {
            const data = await response.json();
            return data.imageUrl || null;
        }
        return null;

    } catch (error) {
        console.error("Image generation error:", error);
        return null;
    }
};
