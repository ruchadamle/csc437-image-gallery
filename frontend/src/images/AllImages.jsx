import { ImageGrid } from "./ImageGrid.jsx";
import { useImages } from "./useImages.js";

export function AllImages() {
    const { imageData, isLoading, error } = useImages();

    return (
        <>
            <h2>All Images</h2>
            {isLoading && <p>Loading...</p>}
            {error !== "" && <p>{error}</p>}
            {!isLoading && error === "" && <ImageGrid images={imageData} />}
        </>
    );
}
