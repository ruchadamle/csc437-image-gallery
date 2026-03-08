import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchOne } from "./ImageFetcher.js";
import { ImageNameEditor } from "./ImageNameEditor.jsx";

export function ImageDetails() {
    const { imageId } = useParams();
    const [imageData, setImageData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;

        async function doFetch() {
            setIsLoading(true);
            setError("");

            try {
                if (!imageId) {
                    if (isActive) {
                        setImageData(null);
                        setError("Image ID is missing");
                    }
                    return;
                }

                const fetchedImage = await fetchOne(imageId);
                if (isActive) {
                    setImageData(fetchedImage);
                }
            } catch (err) {
                if (isActive) {
                    setError(err instanceof Error ? err.message : String(err));
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        doFetch();

        return () => {
            isActive = false;
        };
    }, [imageId]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error !== "") {
        return <p>{error}</p>;
    }

    if (!imageData) {
        return <h2>Image not found</h2>;
    }

    const authorDisplayName = imageData.author?.username ?? imageData.authorId ?? "Unknown";

    return (
        <>
            <h2>{imageData.name}</h2>
            <p>By {authorDisplayName}</p>
            <ImageNameEditor
                imageId={String(imageData._id ?? imageId)}
                initialValue={imageData.name}
                onRenameSuccess={newName => {
                    setImageData(prevImage =>
                        prevImage ? { ...prevImage, name: newName } : prevImage
                    );
                }}
            />
            <img className="ImageDetails-img" src={imageData.src} alt={imageData.name} />
        </>
    );
}
