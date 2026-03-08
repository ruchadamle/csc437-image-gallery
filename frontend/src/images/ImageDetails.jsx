import { useParams } from "react-router";
import { useImages } from "./useImages.js";

export function ImageDetails() {
    const { imageId } = useParams();
    const { imageData, isLoading, error } = useImages();
    const image = imageData.find((imageEntry) => String(imageEntry._id ?? imageEntry.id) === imageId);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error !== "") {
        return <p>{error}</p>;
    }

    if (!image) {
        return <h2>Image not found</h2>;
    }

    const authorDisplayName = image.author?.username ?? image.authorId ?? "Unknown";

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {authorDisplayName}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    );
}
