import { ImageGrid } from "./ImageGrid.jsx";
import { useImages } from "./useImages.js";

export function AllImages({ authToken }) {
    const { imageData, isLoading, error } = useImages(authToken);

    return (
        <>
            <h2>All Images</h2>
            {isLoading && <p>Loading...</p>}
            {error !== "" && <p className="ErrorMessage">{error}</p>}
            {!isLoading && error === "" && <ImageGrid images={imageData} />}
        </>
    );
}
