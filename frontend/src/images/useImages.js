import { useEffect, useState } from "react";
import { fetchAll } from "./ImageFetcher.js";

export function useImages() {
    const [imageData, setImageData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function doFetch() {
            try {
                const result = await fetchAll();
                setImageData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setIsLoading(false);
            }
        }

        doFetch();
    }, []);

    return { imageData, isLoading, error };
}
